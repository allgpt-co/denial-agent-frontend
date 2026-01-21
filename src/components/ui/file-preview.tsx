import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileIcon, X } from "lucide-react"
import { FileViewerDialog } from "@/components/ui/file-viewer-dialog"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  file: File
  onRemove?: () => void
  clickable?: boolean
}

export const FilePreview = React.forwardRef<HTMLDivElement, FilePreviewProps>(
  (props, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const clickable = props.clickable !== false // Default to true

    if (props.file.type.startsWith("image/")) {
      return (
        <>
          <ImageFilePreview 
            {...props} 
            ref={ref} 
            clickable={clickable}
            onOpenDialog={() => setDialogOpen(true)}
          />
          {clickable && (
            <FileViewerDialog
              file={props.file}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          )}
        </>
      )
    }

    if (
      props.file.type.startsWith("text/") ||
      props.file.name.endsWith(".txt") ||
      props.file.name.endsWith(".md")
    ) {
      return (
        <>
          <TextFilePreview 
            {...props} 
            ref={ref} 
            clickable={clickable}
            onOpenDialog={() => setDialogOpen(true)}
          />
          {clickable && (
            <FileViewerDialog
              file={props.file}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          )}
        </>
      )
    }

    return (
      <>
        <GenericFilePreview 
          {...props} 
          ref={ref} 
          clickable={clickable}
          onOpenDialog={() => setDialogOpen(true)}
        />
        {clickable && (
          <FileViewerDialog
            file={props.file}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </>
    )
  }
)
FilePreview.displayName = "FilePreview"

interface ExtendedFilePreviewProps extends FilePreviewProps {
  clickable?: boolean
  onOpenDialog?: () => void
}

const ImageFilePreview = React.forwardRef<HTMLDivElement, ExtendedFilePreviewProps>(
  ({ file, onRemove, clickable = true, onOpenDialog }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      // Don't open dialog if clicking the remove button
      if ((e.target as HTMLElement).closest('button[aria-label="Remove attachment"]')) {
        return
      }
      if (clickable && onOpenDialog) {
        onOpenDialog()
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          clickable && "cursor-pointer hover:border-primary/50 transition-colors"
        )}
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        onClick={handleClick}
      >
        <div className="flex w-full items-center space-x-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Attachment ${file.name}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted object-cover"
            src={URL.createObjectURL(file)}
          />
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove ? (
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
ImageFilePreview.displayName = "ImageFilePreview"

const TextFilePreview = React.forwardRef<HTMLDivElement, ExtendedFilePreviewProps>(
  ({ file, onRemove, clickable = true, onOpenDialog }, ref) => {
    const [preview, setPreview] = React.useState<string>("")

    useEffect(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setPreview(text.slice(0, 50) + (text.length > 50 ? "..." : ""))
      }
      reader.readAsText(file)
    }, [file])

    const handleClick = (e: React.MouseEvent) => {
      // Don't open dialog if clicking the remove button
      if ((e.target as HTMLElement).closest('button[aria-label="Remove attachment"]')) {
        return
      }
      if (clickable && onOpenDialog) {
        onOpenDialog()
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          clickable && "cursor-pointer hover:border-primary/50 transition-colors"
        )}
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        onClick={handleClick}
      >
        <div className="flex w-full items-center space-x-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted p-0.5">
            <div className="h-full w-full overflow-hidden text-[6px] leading-none text-muted-foreground">
              {preview || "Loading..."}
            </div>
          </div>
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove ? (
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
TextFilePreview.displayName = "TextFilePreview"

const GenericFilePreview = React.forwardRef<HTMLDivElement, ExtendedFilePreviewProps>(
  ({ file, onRemove, clickable = true, onOpenDialog }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      // Don't open dialog if clicking the remove button
      if ((e.target as HTMLElement).closest('button[aria-label="Remove attachment"]')) {
        return
      }
      if (clickable && onOpenDialog) {
        onOpenDialog()
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative flex max-w-[200px] rounded-md border p-1.5 pr-2 text-xs",
          clickable && "cursor-pointer hover:border-primary/50 transition-colors"
        )}
        layout
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        onClick={handleClick}
      >
        <div className="flex w-full items-center space-x-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted">
            <FileIcon className="h-6 w-6 text-foreground" />
          </div>
          <span className="w-full truncate text-muted-foreground">
            {file.name}
          </span>
        </div>

        {onRemove ? (
          <button
            className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background z-10"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label="Remove attachment"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        ) : null}
      </motion.div>
    )
  }
)
GenericFilePreview.displayName = "GenericFilePreview"
