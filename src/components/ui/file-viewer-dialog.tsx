import React, { useState, useEffect } from "react"
import { Download, FileIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FileViewerDialogProps {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FileViewerDialog: React.FC<FileViewerDialogProps> = ({
  file,
  open,
  onOpenChange,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!file || !open) {
      setImageUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl)
        }
        return null
      })
      setTextContent("")
      return
    }

    setIsLoading(true)

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setImageUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl)
        }
        return url
      })
      setIsLoading(false)
      
      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url)
      }
    }

    if (
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".csv")
    ) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTextContent(e.target?.result as string)
        setIsLoading(false)
      }
      reader.onerror = () => {
        setTextContent("Error reading file")
        setIsLoading(false)
      }
      reader.readAsText(file)
    } else {
      setIsLoading(false)
    }
  }, [file, open])

  const handleDownload = () => {
    if (!file) return

    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!file) return null

  const isImage = file.type.startsWith("image/")
  const isText =
    file.type.startsWith("text/") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".csv")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 truncate">
              <FileIcon className="h-5 w-5 shrink-0" />
              <span className="truncate">{file.name}</span>
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : isImage && imageUrl ? (
            <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4">
              <img
                src={imageUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          ) : isText ? (
            <div className="bg-muted/30 rounded-lg p-4">
              <pre className="whitespace-pre-wrap break-words text-sm font-mono overflow-auto max-h-[70vh]">
                {textContent || "No content to display"}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <FileIcon className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Preview not available for this file type
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {file.type || "Unknown file type"}
                </p>
              </div>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
