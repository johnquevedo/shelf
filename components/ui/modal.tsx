"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
  titleClassName,
  descriptionClassName,
  closeClassName,
  headerClassName
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeClassName?: string;
  headerClassName?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-1rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:w-[calc(100vw-2rem)] sm:rounded-[32px] sm:p-7",
            contentClassName
          )}
        >
          <div className={cn("mb-5 flex items-start justify-between gap-4 sm:mb-6", headerClassName)}>
            <div>
              <Dialog.Title className={cn("font-display text-xl text-slate-950 sm:text-2xl", titleClassName)}>
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className={cn("mt-2 text-sm text-slate-500", descriptionClassName)}>
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className={cn("rounded-full p-2 text-slate-500 transition hover:bg-slate-100", closeClassName)}>
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
