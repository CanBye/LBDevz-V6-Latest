"use client"

import { createContext, useCallback, useContext, useRef, useState } from "react"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog"

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

type ConfirmFn = (opts: ConfirmOptions | string) => Promise<boolean>

const ConfirmCtx = createContext<ConfirmFn>(async () => false)

export function useConfirm() {
  return useContext(ConfirmCtx)
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ConfirmOptions>({})
  const resolve = useRef<(val: boolean) => void>(() => {})

  const confirm: ConfirmFn = useCallback((input) => {
    const options: ConfirmOptions = typeof input === "string"
      ? { description: input }
      : input
    setOpts(options)
    setOpen(true)
    return new Promise<boolean>(res => { resolve.current = res })
  }, [])

  function handleConfirm() { setOpen(false); resolve.current(true) }
  function handleCancel() { setOpen(false); resolve.current(false) }

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={o => { if (!o) handleCancel() }}>
        <AlertDialogContent from="center" className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{opts.title ?? "Emin misiniz?"}</AlertDialogTitle>
            {opts.description && (
              <AlertDialogDescription>{opts.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {opts.cancelText ?? "İptal"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {opts.confirmText ?? "Devam Et"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmCtx.Provider>
  )
}