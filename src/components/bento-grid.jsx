"use client"
import { cn } from "@/lib/utils"



export function BentoGrid({ items }) {
    return (
        <div className={cn("grid grid-cols-2 gap-3", "sm:grid-cols-3", "md:grid-cols-4")}>
            {items.map((item, i) => {
                const col = item.colspan ?? 1
                const row = item.rowspan ?? 1
                return (
                    <figure
                        key={i}
                        className={cn(
                            "group relative overflow-hidden rounded-lg border bg-card",
                            "col-span-1 row-span-1",
                            col === 2 && "sm:col-span-2",
                            row === 2 && "row-span-2",
                        )}
                    >
                        {/* Use next/image for better performance; fill maintains aspect */}
                        <div className="relative h-full w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.src || "/placeholder.svg"}
                                alt={item.alt}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                        </div>
                        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 text-xs text-white">
                            {item.alt}
                        </figcaption>
                    </figure>
                )
            })}
        </div>
    )
}
