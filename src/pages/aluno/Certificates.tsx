import { useEffect, useState } from "react";
import { certificateService } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      const data = await certificateService.getCertificates();
      setCertificates(data);
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  const handleDownload = (cert) => {
    // Exemplo: gerar PDF simples (substitua por lib como jsPDF/pdfmake para layout avançado)
    const doc = new jsPDF();
    doc.text(`Certificado de Conclusão`, 20, 20);
    doc.text(`Aluno: ${cert.student_name}`, 20, 40);
    doc.text(`Curso: ${cert.course_title}`, 20, 50);
    doc.text(`Concluído em: ${new Date(cert.completed_at).toLocaleDateString()}`, 20, 60);
    doc.save(`certificado-${cert.course_title}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Meus Certificados</h1>
      {loading ? (
        <p>Carregando certificados...</p>
      ) : certificates.length === 0 ? (
        <p>Nenhum certificado disponível ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">{cert.course_title}</h2>
                <p className="text-sm mb-1">Aluno: {cert.student_name}</p>
                <p className="text-xs mb-1">Concluído em: {new Date(cert.completed_at).toLocaleDateString()}</p>
              </div>
              <Button className="mt-4" onClick={() => handleDownload(cert)}>
                Baixar PDF
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
