import { LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}
export function SpinnerCustom() {
  return (
    <div className="mx-auto w-full max-w-sm flex justify-center">
      <Spinner />
    </div>
  )
}
