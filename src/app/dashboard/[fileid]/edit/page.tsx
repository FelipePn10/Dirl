"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { trpc } from "@/app/_trpc/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface Annotation {
    type: 'text' | 'image';
    content: string;
    x: number;
    y: number;
}

export default function PdfEditor({ params }: { params: { fileId: string } }) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [scale, setScale] = useState(1.0)
    const [annotations, setAnnotations] = useState<Annotation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { toast } = useToast()

    const { mutate: updatePdf } = trpc.updatePdf.useMutation({
        onSuccess: () => {
            toast({
                title: "Sucesso!",
                description: "PDF atualizado com sucesso.",
            })
            setIsLoading(false)
        },
        onError: () => {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o PDF. Tente novamente.",
                variant: "destructive",
            })
            setIsLoading(false)
        },
    })

    const handleSave = useCallback(() => {
        setIsLoading(true)
        updatePdf({
            fileId: params.fileId,
            content: JSON.stringify(annotations),
        })
    }, [params.fileId, updatePdf, annotations])

    const handleAddText = useCallback((text: string) => {
        setAnnotations(prev => [...prev, { type: 'text', content: text, x: 50, y: 50 }])
    }, [])

    const handleAddImage = useCallback((imageUrl: string) => {
        setAnnotations(prev => [...prev, { type: 'image', content: imageUrl, x: 50, y: 50 }])
    }, [])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Editor de PDF</h1>

            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="mb-4 flex space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Adicionar Texto</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Texto</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Digite o texto que deseja adicionar ao PDF.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="text">Texto</Label>
                                        <Input
                                            id="text"
                                            defaultValue="Novo texto"
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => handleAddText("Novo texto")}>Adicionar</Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Adicionar Imagem</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Imagem</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Insira a URL da imagem que deseja adicionar ao PDF.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="imageUrl">URL da Imagem</Label>
                                        <Input
                                            id="imageUrl"
                                            defaultValue="https://exemplo.com/imagem.jpg"
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => handleAddImage("https://exemplo.com/imagem.jpg")}>Adicionar</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="border rounded-md mb-4 overflow-auto h-[600px]">
                    <Document
                        file={`/api/pdf/${params.fileId}`}
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            canvasRef={canvasRef}
                        />
                    </Document>
                    {annotations.map((annotation, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                left: annotation.x,
                                top: annotation.y,
                                cursor: 'move',
                            }}
                        >
                            {annotation.type === 'text' ? (
                                <p>{annotation.content}</p>
                            ) : (
                                <img src={annotation.content} alt="Annotation" style={{ maxWidth: '100px' }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Button
                            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                            disabled={pageNumber <= 1}
                        >
                            Anterior
                        </Button>
                        <span className="mx-2">
                            Página {pageNumber} de {numPages}
                        </span>
                        <Button
                            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
                            disabled={pageNumber >= (numPages || 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                    <div>
                        <Button onClick={() => setScale(prev => prev - 0.1)} disabled={scale <= 0.5}>-</Button>
                        <span className="mx-2">{Math.round(scale * 100)}%</span>
                        <Button onClick={() => setScale(prev => prev + 0.1)} disabled={scale >= 2}>+</Button>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}