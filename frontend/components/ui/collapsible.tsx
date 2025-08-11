import * as React from "react"
import { cn } from "../../lib/utils"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible")
  }
  return context
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ defaultOpen = false, open: openProp, onOpenChange, className, children, ...props }, ref) => {
    const [openState, setOpenState] = React.useState(defaultOpen)
    const open = openProp !== undefined ? openProp : openState
    
    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (openProp === undefined) {
        setOpenState(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [openProp, onOpenChange])

    return (
      <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, children, ...props }, ref) => {
    const { open, onOpenChange } = useCollapsible()
    
    return (
      <button
        ref={ref}
        type="button"
        data-state={open ? "open" : "closed"}
        onClick={(e) => {
          onClick?.(e)
          onOpenChange(!open)
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = useCollapsible()
    
    return (
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "animate-in slide-in-from-top-1" : "animate-out slide-out-to-top-1 h-0",
          className
        )}
        style={{
          height: open ? "auto" : 0,
        }}
        {...props}
      >
        {open && children}
      </div>
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }