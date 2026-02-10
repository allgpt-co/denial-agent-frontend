import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, Info, Loader2, Mic, Paperclip, Square } from "lucide-react"
import { omit } from "remeda"
import { cn } from "@/lib/utils"
import { useAudioRecording } from "@/hooks/use-audio-recording"
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea"
import { AudioVisualizer } from "@/components/ui/audio-visualizer"
import { Button } from "@/components/ui/button"
import { FilePreview } from "@/components/ui/file-preview"
import { InterruptPrompt } from "@/components/ui/interrupt-prompt"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { validateFiles } from "@/lib/constants"

interface MessageInputBaseProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  submitOnEnter?: boolean
  stop?: () => void
  isGenerating: boolean
  enableInterrupt?: boolean
  transcribeAudio?: (blob: Blob) => Promise<string>
  suggestions?: string[]
  append?: (message: { role: "user"; content: string }) => void

  // Voice props
  isListening?: boolean
  startListening?: () => void
  stopListening?: () => void
  isSpeechSupported?: boolean
}

interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false
}

interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true
  files: File[] | null
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
}

type MessageInputProps =
  | MessageInputWithoutAttachmentProps
  | MessageInputWithAttachmentsProps

export function MessageInput({
  placeholder = "Ask AI...",
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = true,
  transcribeAudio,
  suggestions,
  append,
  isListening: externalIsListening,
  startListening,
  stopListening,
  isSpeechSupported: externalIsSpeechSupported,
  ...props
}: MessageInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false)

  const {
    isListening: internalIsListening,
    isSpeechSupported: internalIsSpeechSupported,
    isRecording,
    isTranscribing,
    audioStream,
    toggleListening: internalToggleListening,
    stopRecording,
  } = useAudioRecording({
    transcribeAudio,
    onTranscriptionComplete: (text) => {
      props.onChange?.({ target: { value: text } } as any)
    },
  })

  const isListening = externalIsListening ?? internalIsListening
  const isSpeechSupported = externalIsSpeechSupported ?? internalIsSpeechSupported

  const toggleListening = () => {
    if (externalIsListening !== undefined && startListening && stopListening) {
      if (externalIsListening) {
        stopListening()
      } else {
        startListening()
      }
    } else {
      internalToggleListening()
    }
  }

  useEffect(() => {
    if (!isGenerating) {
      setShowInterruptPrompt(false)
    }
  }, [isGenerating])

  const addFiles = (files: File[] | null) => {
    if (props.allowAttachments) {
      props.setFiles((currentFiles) => {
        if (currentFiles === null) {
          return files
        }

        if (files === null) {
          return currentFiles
        }

        return [...currentFiles, ...files]
      })
    }
  }

  const onDragOver = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (event: React.DragEvent) => {
    setIsDragging(false)
    if (props.allowAttachments !== true) return
    event.preventDefault()
    const dataTransfer = event.dataTransfer
    if (dataTransfer.files.length) {
      addFiles(Array.from(dataTransfer.files))
    }
  }

  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    const text = event.clipboardData.getData("text")
    if (text && text.length > 500 && props.allowAttachments) {
      event.preventDefault()
      const blob = new Blob([text], { type: "text/plain" })
      const file = new File([blob], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now(),
      })
      addFiles([file])
      return
    }

    const files = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null)

    if (props.allowAttachments && files.length > 0) {
      addFiles(files)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      if (isGenerating && stop && enableInterrupt) {
        if (showInterruptPrompt) {
          stop()
          setShowInterruptPrompt(false)
          event.currentTarget.form?.requestSubmit()
        } else if (
          props.value ||
          (props.allowAttachments && props.files?.length)
        ) {
          setShowInterruptPrompt(true)
          return
        }
      }

      event.currentTarget.form?.requestSubmit()
    }

    onKeyDownProp?.(event)
  }

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [textAreaHeight, setTextAreaHeight] = useState<number>(0)

  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(textAreaRef.current.offsetHeight)
    }
  }, [props.value])

  const showFileList =
    props.allowAttachments && props.files && props.files.length > 0

  useAutosizeTextArea({
    ref: textAreaRef as React.RefObject<HTMLTextAreaElement>,
    maxHeight: 200,
    borderWidth: 1,
    dependencies: [props.value, showFileList],
  })

  return (
    <div
      className="relative flex w-full"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {enableInterrupt && (
        <InterruptPrompt
          isOpen={showInterruptPrompt}
          close={() => setShowInterruptPrompt(false)}
        />
      )}

      <RecordingPrompt
        isVisible={isRecording}
        onStopRecording={stopRecording}
      />

      {suggestions && append && suggestions.length > 0 && (
        <div className="mb-2">
          <PromptSuggestions label="" append={append} suggestions={suggestions} />
        </div>
      )}

      <div className="relative flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <textarea
            aria-label="Write your prompt here"
            placeholder={placeholder}
            ref={textAreaRef}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            className={cn(
              "z-10 w-full grow resize-none rounded-lg border border-input bg-background/50 backdrop-blur-sm p-4 pr-28 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
              showFileList && "pb-20",
              className
            )}
            {...(props.allowAttachments
              ? omit(props, ["allowAttachments", "files", "setFiles"])
              : omit(props, ["allowAttachments"]))}
          />

          {props.allowAttachments && (
            <div className="absolute inset-x-3 bottom-0 z-20 py-3">
              <div className="flex space-x-3">
                <AnimatePresence mode="popLayout">
                  {props.files?.map((file) => {
                    return (
                      <FilePreview
                        key={file.name + String(file.lastModified)}
                        file={file}
                        onRemove={() => {
                          props.setFiles((files) => {
                            if (!files) return null

                            const filtered = Array.from(files).filter(
                              (f) => f !== file
                            )
                            if (filtered.length === 0) return null
                            return filtered
                          })
                        }}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {suggestions && append && suggestions.length > 0 && (
        <div className="mt-2">
          <PromptSuggestions label="" append={append} suggestions={suggestions} />
        </div>
      )}

      <div className="absolute right-3 top-3 z-20 flex gap-1">
        <TooltipProvider delayDuration={0}>
          {props.allowAttachments && (
            <AttachmentButton
              onClick={async () => {
                const files = await showFileUploadDialog()
                if (files && files.length > 0) {
                  // Validate files before adding
                  try {
                    const validation = validateFiles(files)
                    if (!validation.valid) {
                      // Show error toast or alert
                      alert(validation.error || 'File validation failed')
                      return
                    }
                    addFiles(files)
                  } catch (error) {
                    console.error('Error validating files:', error)
                    // Still add files if validation import fails
                    addFiles(files)
                  }
                }
              }}
            />
          )}

          <VoiceInputButton
            isSupported={!!isSpeechSupported}
            isListening={!!isListening}
            onClick={toggleListening}
          />

          <SubmitActionButton
            isGenerating={isGenerating}
            stop={stop}
            disabled={props.value === "" || isGenerating}
          />
        </TooltipProvider>
      </div>

      {props.allowAttachments && <FileUploadOverlay isDragging={isDragging} />}

      <RecordingControls
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        audioStream={audioStream}
        textAreaHeight={textAreaHeight}
        onStopRecording={stopRecording}
      />
    </div>
  )
}
MessageInput.displayName = "MessageInput"

interface FileUploadOverlayProps {
  isDragging: boolean
}

function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <Paperclip />
          <span>Drop your files here to attach them.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function showFileUploadDialog(): Promise<File[] | null> {
  const input = document.createElement("input")
  input.type = "file"
  input.multiple = true
  input.accept = "*/*"
  input.style.display = "none"

  return new Promise<File[] | null>((resolve) => {
    let resolved = false
    const finish = (value: File[] | null) => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(value)
    }

    const cleanup = () => {
      window.removeEventListener("focus", onWindowFocus)
      clearTimeout(focusTimeoutId)
    }

    let focusTimeoutId: ReturnType<typeof setTimeout>

    const onWindowFocus = () => {
      // When dialog closes (cancel or after select), window gets focus.
      // Delay so onchange can run first if user selected files.
      focusTimeoutId = setTimeout(() => finish(null), 100)
    }

    input.onchange = (e) => {
      const files = (e.currentTarget as HTMLInputElement).files
      finish(files && files.length ? Array.from(files) : null)
    }

    window.addEventListener("focus", onWindowFocus)
    input.click()
  })
}

function TranscribingOverlay() {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <motion.div
          className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Transcribing audio...
      </p>
    </motion.div>
  )
}

interface RecordingPromptProps {
  isVisible: boolean
  onStopRecording: () => void
}

function RecordingPrompt({ isVisible, onStopRecording }: RecordingPromptProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ top: 0, filter: "blur(5px)" }}
          animate={{
            top: -40,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              filter: { type: "tween" },
            },
          }}
          exit={{ top: 0, filter: "blur(5px)" }}
          className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer overflow-hidden whitespace-nowrap rounded-full border bg-background py-1 text-center text-sm text-muted-foreground"
          onClick={onStopRecording}
        >
          <span className="mx-2.5 flex items-center">
            <Info className="mr-2 h-3 w-3" />
            Click to finish recording
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface RecordingControlsProps {
  isRecording: boolean
  isTranscribing: boolean
  audioStream: MediaStream | null
  textAreaHeight: number
  onStopRecording: () => void
}

function RecordingControls({
  isRecording,
  isTranscribing,
  audioStream,
  textAreaHeight,
  onStopRecording,
}: RecordingControlsProps) {
  if (isRecording) {
    return (
      <div
        className="absolute inset-[1px] z-50 overflow-hidden rounded-xl"
        style={{ height: textAreaHeight - 2 }}
      >
        <AudioVisualizer
          stream={audioStream}
          isRecording={isRecording}
          onClick={onStopRecording}
        />
      </div>
    )
  }

  if (isTranscribing) {
    return (
      <div
        className="absolute inset-[1px] z-50 overflow-hidden rounded-xl"
        style={{ height: textAreaHeight - 2 }}
      >
        <TranscribingOverlay />
      </div>
    )
  }

  return null
}

interface ActionButtonProps {
  onClick?: () => void
  disabled?: boolean
  className?: string
}

function AttachmentButton({ onClick, className }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
          aria-label="Attach a file"
          onClick={onClick}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Attach file</TooltipContent>
    </Tooltip>
  )
}

function VoiceInputButton({
  isSupported,
  isListening,
  onClick,
}: {
  isSupported: boolean
  isListening: boolean
  onClick: () => void
}) {
  if (!isSupported) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={isListening ? "Stop recording" : "Voice input"}
          size="icon"
          onClick={onClick}
          className={cn(
            "h-8 w-8 transition-all duration-200",
            isListening
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isListening ? (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isListening ? "Stop recording" : "Use voice input"}
      </TooltipContent>
    </Tooltip>
  )
}

function SubmitActionButton({
  isGenerating,
  stop,
  disabled,
}: {
  isGenerating: boolean
  stop?: () => void
  disabled: boolean
}) {
  if (isGenerating && stop) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="h-3 w-3 animate-pulse fill-current" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Stop generating</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full transition-all duration-200",
            disabled ? "opacity-50" : "bg-primary text-primary-foreground shadow-sm"
          )}
          aria-label="Send message"
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Send message</TooltipContent>
    </Tooltip>
  )
}
