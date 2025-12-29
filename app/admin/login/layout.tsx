import Image from "next/image";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background image reused from Hero section */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/herobg.png"
          alt="Background"
          fill
          priority
          className="object-cover object-left lg:object-center"
        />
        {/* Very light overlay so the image is clearly visible, but text still pops */}
        <div className="absolute inset-0 bg-white/15 lg:bg-white/10" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

