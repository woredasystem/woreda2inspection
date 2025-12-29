import Image from "next/image";
import { ComponentProps } from "react";

/**
 * Image component that automatically handles Supabase Storage URLs and blob URLs
 * by using unoptimized mode to avoid Next.js Image optimization issues
 */
export function SupabaseImage({
    src,
    ...props
}: ComponentProps<typeof Image>) {
    // Check if the image is from Supabase Storage or a blob URL
    // Both need unoptimized mode
    const needsUnoptimized = typeof src === 'string' && 
        (src.includes('supabase.co/storage') || 
         src.includes('supabase.co/object') ||
         src.startsWith('blob:'));

    return (
        <Image
            {...props}
            src={src}
            unoptimized={needsUnoptimized}
        />
    );
}

