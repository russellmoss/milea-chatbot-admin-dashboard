import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getAllDomains } from "../domain/apis";
import { getSyncSetting } from "../setting/apis";


const s3 = new S3Client({
  region: process.env.REACT_APP_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!
  }
});

async function listMarkdownFiles(bucket: string, prefix: string): Promise<string[]> {
  let continuationToken: string | undefined = undefined;
  const mdFiles: string[] = [];

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
        mdFiles.push(obj.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return mdFiles;
}

function decodeUrlFromFilename(encoded: string): string {
  return decodeURIComponent(encoded);
}

export const getAllMarkdownFiles = async (baseurl: string): Promise<Record<string, string[]>> => {
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET!;
    const baseFolderPrefix = "output-" + baseurl.replace("https://", "");
    const allDomains = await getAllDomains();
    const genreNames = allDomains.map(domain => domain.name.toLowerCase());
    genreNames.push("unknown");
    console.debug("Genre names: ", genreNames);

    let result: Record<string, string[]> = {};
    for (const genreName of genreNames) {
        console.debug(`Fetching markdown files for path: ${baseFolderPrefix + genreName}/`);
        const markdownFiles = await listMarkdownFiles(bucketName, baseFolderPrefix + genreName + "/");
        console.debug(`Found ${markdownFiles.length} markdown files for genre: ${genreName}`);
        result[genreName] = markdownFiles.map(file => decodeUrlFromFilename(file.replace(`${baseFolderPrefix}${genreName}/`, "")));
    }
    console.debug("Markdown files by genre: ", result);


    const allVals = Object.values(result).flat();
    console.debug("All markdown files fetched successfully. count: ", allVals.length);
    
    const debugUrls = []
    for (const val of allVals) {
        debugUrls.push(`${val.replace(".md", "")}`);
    }
    console.debug('debugUrls: ', debugUrls);

    const syncSettings = await getSyncSetting();
    const urls = syncSettings.webSyncSetting.urls;

    // compare allVals with urls and see which ones are missing
    let missingUrls: string[] = [];
    for (const url of urls) {
        const cleanedUrl = url.replace("https://", "") + ".md";
        if (!allVals.includes(cleanedUrl)) {
            missingUrls.push(cleanedUrl.replace(".md", ""));
        }
    }
    console.debug("Missing markdown files: ", missingUrls);

    return result;
}
