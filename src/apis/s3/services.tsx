import isEqual from "lodash.isequal";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
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
    const allVals = Object.values(result).flat();
    console.debug("All markdown files fetched successfully. count: ", allVals.length);
    
    return result;
}

// This function updates the filenames in the domains based on the provided mapData
// mapData is a Record where keys are domain names and values are arrays of MarkdownFileData pulled from S3
// So whenever new files added or removed from S3, this function will ensure the domain's file list is up-to-date
export async function updateDomainFilenames(domains: Domain[], mapData: Record<string, MarkdownFileData[]>): Promise<Domain[]> {
    const updatedDomains = await Promise.all(domains.map(async (domain) => {
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

        const needsUpdate = !isEqual(domain.filenames, expectedFilenames);
        if (needsUpdate) {
            await updateDomain(domain.id, { filenames: expectedFilenames });
        }

        return {
            ...domain,
            filenames: expectedFilenames
        };
    }));

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

export const updateS3MarkdownContent = async (s3_key: string, content: string): Promise<void> => {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET!;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3_key,
        Body: content,
        ContentType: "text/markdown",
        CacheControl: "no-store, no-cache, must-revalidate, proxy-revalidate",
        Expires: new Date(0)
    });

    try {
        await s3.send(command);
    } catch (error) {
        console.error("Error updating S3 content:", error);
        throw error;
    }
}

export const encodeS3Key = (key: string): string => {
  return key
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
};

export const moveFile = async (old_s3_key: string, new_s3_key: string): Promise<void> => {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET!;
    console.debug("Moving file from:", old_s3_key);
    console.debug("To:", new_s3_key);

    try {
        // Step 1: Get content
        const getCmd = new GetObjectCommand({
            Bucket: bucketName,
            Key: old_s3_key,
        });
        const getResult = await s3.send(getCmd);
        const content = await streamToString(getResult.Body as ReadableStream<Uint8Array>);
        console.debug("File content fetched successfully.");

        // Step 2: Put to new key
        const putCmd = new PutObjectCommand({
            Bucket: bucketName,
            Key: new_s3_key,
            Body: content,
            ContentType: "text/markdown",
            CacheControl: "no-store, no-cache, must-revalidate, proxy-revalidate",
            Expires: new Date(0),
        });
        await s3.send(putCmd);
        console.debug("File copied to new location successfully.");

        // Step 3: Delete old key
        const deleteCmd = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: old_s3_key,
        });
        await s3.send(deleteCmd);
        console.debug("Old file deleted successfully.");

        console.log("✅ File moved successfully.");
    } catch (error) {
        console.error("❌ Error moving file:", error);
        throw error;
    }
};
