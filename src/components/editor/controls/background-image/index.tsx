"use client";
import React, { useRef } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { backgroundImageAtom } from "@/store/editor/editor";
import { ImageIcon, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const BackgroundImageControl: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useAtom(backgroundImageAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <Field>
      <FieldLabel>Background</FieldLabel>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="relative"
              style={
                backgroundImage
                  ? {
                      backgroundImage: `url("${backgroundImage}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              <ImageIcon className={backgroundImage ? "opacity-0" : ""} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload background image</TooltipContent>
        </Tooltip>

        {backgroundImage && (
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" onClick={() => setBackgroundImage("")}>
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove background image</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </Field>
  );
};

export default BackgroundImageControl;
