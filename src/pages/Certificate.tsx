import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Certificate as CertificateType } from "@/types";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";

const Certificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<CertificateType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        if (certificateId) {
          const certificateData = await certificateService.getCertificateById(certificateId);
          setCertificate(certificateData);
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
        toast.error("Erro ao carregar certificado");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF to download
    toast.success("Certificado baixado com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Certificado não encontrado</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard")}>
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Certificado</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Certificate Card */}
      <div className="flex items-center justify-center p-4">
        <Card ref={certificateRef} className="w-full max-w-3xl p-8 border-4 border-primary print:border-4">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-wider">Certificado de Conclusão</h2>
              <p className="text-muted-foreground">Este certificado é concedido a</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold">{certificate.userName}</h3>
              <div className="w-40 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg">por concluir com sucesso o curso</p>
              <h4 className="text-2xl font-medium">{certificate.courseName}</h4>
            </div>
            
            <div className="pt-4">
              <p className="text-muted-foreground">
                Emitido em{" "}
                {new Date(certificate.issueDate).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            
            <div className="flex justify-between w-full pt-8">
              <div className="text-center">
                <div className="w-32 h-px bg-border mb-2"></div>
                <p className="text-sm">Assinatura do Instrutor</p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-px bg-border mb-2"></div>
                <p className="text-sm">Diretor da Instituição</p>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">ID do Certificado: {certificate.id}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Certificate;
