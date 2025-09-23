// file: dialogus-next/app/components/RichTextComponents.tsx

import Image from "next/image";
import { urlFor } from "../../lib/sanity.client";

export const RichTextComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative w-full h-96 my-8 mx-auto">
          <Image
            className="object-contain"
            src={urlFor(value).url()}
            alt={value.alt || "Insight Post Image"}
            fill
          />
        </div>
      );
    },
  },
};