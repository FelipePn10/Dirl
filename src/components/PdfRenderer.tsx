"use client"

import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf"

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

import { useResizeDetector } from "react-resize-detector"
import { Button } from "./ui/button";
import { Input } from "./ui/input";



//import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();


interface PdfRendererProps {
    url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {

    const { toast } = useToast()

    const { width, ref } = useResizeDetector()

    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col itemns-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex itemns-center gap-1.5">
                    <Button variant="ghost" aria-label="previous page">
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <Input className="w-12 h-8" />
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <div ref={ref}>
                    <Document
                        loading={
                            <div className="flex justify-center">
                                <Loader2 className="my-24 h-6 w-6 animate-spin" />
                            </div>
                        }
                        onLoadError={() => {
                            toast({
                                title: 'Error ao carregar o PDF',
                                description: 'Verifique sua conexão com a internet e tente novamente.',
                                variant: 'destructive'
                            })
                        }}
                        file={url} className="max-h-full">
                        <Page width={width ? width : 1} pageNumber={1} />
                    </Document>
                </div>
            </div>
        </div>
    )
}

export default PdfRenderer