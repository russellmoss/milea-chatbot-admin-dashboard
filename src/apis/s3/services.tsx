import isEqual from "lodash.isequal";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getAllDomains, updateDomain } from "../domain/apis";
import { Domain } from "../domain/interfaces";


const s3 = new S3Client({
  region: process.env.REACT_APP_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!
  }
});

interface MarkdownS3File {
    key: string;
    lastModified?: Date;
    size?: number;
}

async function listMarkdownFiles(bucket: string, prefix: string): Promise<MarkdownS3File[]> {
  let continuationToken: string | undefined = undefined;
  const mdFiles: MarkdownS3File[] = [];

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken
    });

    const response = await s3.send(command);
    const contents = response.Contents || [];

    for (const obj of contents) {
      if (obj.Key && obj.Key.endsWith(".md")) {
        mdFiles.push({
          key: obj.Key,
          lastModified: obj.LastModified,
          size: obj.Size
        });
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return mdFiles;
}

interface MarkdownFileData {
  filename: string; // decoded name (url)
  s3Key: string;
  lastModified?: Date;
  size?: number;
}

export const getAllMarkdownFiles = async (baseurl: string): Promise<Record<string, MarkdownFileData[]>> => {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET!;
    const baseFolderPrefix = "output-" + baseurl.replace("https://", "");
    const allDomains = await getAllDomains();
    const genreNames = allDomains.map(domain => domain.name.toLowerCase());
    genreNames.push("unknown"); // this is a default for those md files that ai fails to determine the genre

    let result: Record<string, MarkdownFileData[]> = {};
    for (const genreName of genreNames) {
        const rawFiles = await listMarkdownFiles(bucketName, baseFolderPrefix + genreName + "/");
        result[genreName] = rawFiles.map(file => {
            const decodedFilename = decodeURIComponent(file.key.replace(`${baseFolderPrefix}${genreName}/`, ""));
            return {
                filename: decodedFilename,
                s3Key: file.key,
                lastModified: file.lastModified,
                size: file.size
            };
        });
    }
    console.debug("Markdown files by genre: ", result);
    const allVals = Object.values(result).flat();
    console.debug("All markdown files fetched successfully. count: ", allVals.length);
    
    return result;
}

export async function updateDomainFilenames(domains: Domain[], mapData: Record<string, MarkdownFileData[]>): Promise<Domain[]> {
    const updatedDomains = domains.map(domain => {
        const domainKey = domain.name.toLowerCase();
        const files = mapData[domainKey] || [];

        const newFilenames = files.map(file => ({
        filename: file.filename,
        content: file.s3Key,
        size: file.size || 0,
        author: "",
        createdAt: file.lastModified?.toISOString() || "",
        updatedAt: new Date().toISOString()
        }));

        if (!isEqual(domain.filenames, newFilenames)) {
        domain.filenames = newFilenames;
        }

        return domain;
    });

    // Wait for all update API calls in parallel
    await Promise.all(
        updatedDomains.map(async domain => {
        const domainKey = domain.name.toLowerCase();
        const files = mapData[domainKey] || [];

        const expectedFilenames = files.map(file => {
            const existing = domain.filenames?.find(f => f.content === file.s3Key);
            return {
            filename: file.filename,
            content: file.s3Key,
            size: file.size || 0,
            author: "",
            createdAt: file.lastModified?.toISOString() || "",
            updatedAt: existing?.updatedAt || new Date().toISOString()
            };
        });

        if (!isEqual(domain.filenames, expectedFilenames)) {
            domain.filenames = expectedFilenames; // keep domain state consistent
            await updateDomain(domain.id, { filenames: expectedFilenames });
        }
        })
    );

    return updatedDomains;
}

export const pullS3MarkdownContent = async (s3_key: string): Promise<string> => {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET!;
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3_key
    });

    try {
        const response = await s3.send(command);
        if (!response.Body) {
        throw new Error("No content found for the specified S3 key.");
        }
        
        const bodyContents = await streamToString(response.Body);
        return bodyContents;
    } catch (error) {
        console.error("Error fetching S3 content:", error);
        throw error;
    }
}

// Helper function to convert stream to string
function streamToString(stream: any): Promise<string> {
    if (typeof window !== "undefined") {
        // Browser: response.Body is a ReadableStream
        return new Response(stream).text();
    }
    // Node.js: response.Body is a Readable
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
}
