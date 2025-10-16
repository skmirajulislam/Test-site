import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            // You can add authentication here if needed

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { uploadedBy: "user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Image upload complete for:", metadata.uploadedBy);
            console.log("File URL:", file.ufsUrl);
            console.log("File key:", file.key);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return {
                uploadedBy: metadata.uploadedBy,
                url: file.ufsUrl,
                key: file.key
            };
        }),

    videoUploader: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
        .middleware(async () => {
            return { uploadedBy: "user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Video upload complete for:", metadata.uploadedBy);
            console.log("File URL:", file.ufsUrl);
            console.log("File key:", file.key);

            return {
                uploadedBy: metadata.uploadedBy,
                url: file.ufsUrl,
                key: file.key
            };
        }),

    mediaUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "64MB", maxFileCount: 1 }
    })
        .middleware(async () => {
            return { uploadedBy: "user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Media upload complete for:", metadata.uploadedBy);
            console.log("File URL:", file.ufsUrl);
            console.log("File key:", file.key);

            // Return key so it's available in onClientUploadComplete
            return {
                uploadedBy: metadata.uploadedBy,
                url: file.ufsUrl,
                key: file.key
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
