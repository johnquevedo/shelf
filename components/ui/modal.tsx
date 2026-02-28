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
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white p-7 shadow-2xl",
            contentClassName
          )}
        >
          <div className={cn("mb-6 flex items-start justify-between", headerClassName)}>
            <div>
              <Dialog.Title className={cn("font-display text-2xl text-slate-950", titleClassName)}>
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
