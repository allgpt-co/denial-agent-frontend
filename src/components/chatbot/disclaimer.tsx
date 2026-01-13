import { Button } from "@/components/ui/button"
import { ShieldCheck, Cookie } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DisclaimerProps {
    onAccept: () => void
    open: boolean
}

export function Disclaimer({ onAccept, open }: DisclaimerProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-6"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-[320px] w-full space-y-5"
                    >
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight">Welcome</h2>
                        </div>

                        <div className="space-y-3 text-center">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This AI assistant is designed to help you with your tasks.
                            </p>

                            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground text-left border border-border/50 flex gap-2">
                                <Cookie className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    We use local storage to save your chat history and preferences for a better experience.
                                </span>
                            </div>
                        </div>

                        <Button onClick={onAccept} className="w-full font-medium shadow-primary/20 shadow-lg">
                            Accept & Continue
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
