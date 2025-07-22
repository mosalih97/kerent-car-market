import { cn } from "@/lib/utils";

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const WatermarkedImage = ({ src, alt, className, onClick }: WatermarkedImageProps) => {
  return (
    <div className="relative overflow-hidden" onClick={onClick}>
      <img 
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
      />
      
      {/* العلامة المائية */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-20 transform -rotate-12">
          {/* الشعار */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-3 rounded-lg border-2 border-amber-500 shadow-lg">
            <img
              src="/lovable-uploads/6e1da3af-20f1-469a-8fb3-547fa3c534ac.png"
              alt="شعار الكرين"
              className="w-12 h-12 object-contain"
            />
          </div>
          
          {/* النص */}
          <div className="text-4xl font-bold text-gray-800 drop-shadow-lg">
            الكرين
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkedImage;