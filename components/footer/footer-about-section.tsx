"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ABOUT_CONTENT } from "./footer-data";

const FooterAboutSection = () => {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="about" className="border-none">
            <AccordionTrigger className="py-6 text-lg font-semibold text-gray-900 hover:text-blue-600 hover:no-underline">
              More About AJS Vritti Vision Marketing
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-6">
                {ABOUT_CONTENT.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default FooterAboutSection;
