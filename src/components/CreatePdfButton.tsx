import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { trpc } from "@/app/_trpc/client"

const CreatePdfContent = ({ onClose }: { onClose: () => void }) => {
    const [step, setStep] = useState<'initial' | 'title'>("initial")
    const [title, setTitle] = useState("")
    const router = useRouter()
    const { toast } = useToast()

    const { mutate: createPdf } = trpc.pdf.createPdf.useMutation({
        onSuccess: (file) => {
            toast({
                title: 'Sucesso!',
                description: 'Seu novo PDF foi criado.',
                variant: 'default',
            })
            router.push(`/dashboard/${file.id}/edit`)
            onClose()
        },
        onError: () => {
            toast({
                title: 'Erro',
                description: 'Não foi possível criar o PDF. Tente novamente.',
                variant: 'destructive',
            })
        },
    })

    const handleCreate = () => {
        if (!title.trim()) {
            toast({
                title: 'Erro',
                description: 'Por favor, insira um título para o PDF.',
                variant: 'destructive',
            })
            return
        }
        createPdf({ title: title.trim() })
    }

    if (step === 'initial') {
        return (
            <div className="flex items-center justify-center h-64 m-4">
                <div className="text-center">
                    <FileText className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Criar novo PDF</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        Crie um documento PDF personalizado
                    </p>
                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setStep('title')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Começar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4">
            <DialogHeader>
                <DialogTitle>Digite o título do seu PDF</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Meu novo documento"
                    className="w-full"
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button
                    variant="outline"
                    onClick={() => setStep('initial')}
                >
                    Voltar
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={!title.trim()}
                >
                    Criar PDF
                </Button>
            </div>
        </div>
    )
}

const CreatePdfButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v)
                }
            }}
        >
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar PDF
                </Button>
            </DialogTrigger>

            <DialogContent>
                <CreatePdfContent onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

export default CreatePdfButton