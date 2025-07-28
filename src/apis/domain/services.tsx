import { Domain, DomainFile } from "./interfaces";
import { updateDomain } from "./apis";
import { moveFile } from "../s3/services";


export const updateDomainFileLocation = async (domains: Domain[], from: Domain, to: Domain, domainFile: DomainFile): Promise<Domain[]> => {
    if (!from || !to) {
        throw new Error("One or both specified domains could not be found.");
    }

    const oldS3Key = domainFile.content;
    const oldFolder = from.name.toLowerCase();
    const newFolder = to.name.toLowerCase();
    const fileName = oldS3Key.split('/').pop();
    const prefix = oldS3Key.split('/')[0];
    const newS3Key = `${prefix}/${newFolder}/${fileName}`;
    console.log(`Moving file from S3 folder: ${oldFolder} to ${newFolder}`);

    const updatedFromFiles = from.filenames.filter(
        file => file.content !== domainFile.content
    );
    domainFile.content = newS3Key; // Update the file's content to the new S3 key
    domainFile.updatedAt = new Date().toISOString(); // Update the timestamp
    const updatedToFiles = [...to.filenames, domainFile];

    const [updatedFromDomain, updatedToDomain] = await Promise.all([
        updateDomain(from.id, { filenames: updatedFromFiles }),
        updateDomain(to.id, { filenames: updatedToFiles }),
        moveFile(oldS3Key, newS3Key)
    ]);

    return domains.map(domain => {
        if (domain.id === from.id) return updatedFromDomain;
        if (domain.id === to.id) return updatedToDomain;
        return domain;
    });
};