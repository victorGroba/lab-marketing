import { PrismaClient, Papel, StatusPost } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando usuarios...");

  const senhaHash = await bcrypt.hash("lab@2025", 12);

  const ti = await prisma.user.upsert({
    where: { email: "ti@laboratorio.com" },
    update: {},
    create: {
      nome: "Equipe TI",
      email: "ti@laboratorio.com",
      senhaHash,
      papel: Papel.TI,
    },
  });

  const diretor = await prisma.user.upsert({
    where: { email: "diretor@laboratorio.com" },
    update: {},
    create: {
      nome: "Diretor Financeiro",
      email: "diretor@laboratorio.com",
      senhaHash,
      papel: Papel.DIRETOR,
    },
  });

  console.log("Criando posts de exemplo...");

  const posts = [
    {
      titulo: "Coleta domiciliar: comodidade e segurança",
      pilar: "Educacao em Saude",
      baseNormativa: "RDC 786/2023",
      textoArte: "Seu exame no conforto da sua casa",
      legenda: "Sabia que oferecemos coleta de sangue em domicilio? Agende pelo WhatsApp e cuide da sua saude sem sair de casa.",
      hashtags: "#laboratorio #coletadomiciliar #saude #examedelaboratorio",
      promptImagem: "Profissional de saude com jaleco branco realizando coleta de sangue em residencia, ambiente aconchegante, luz natural, tons teal e branco",
      status: StatusPost.PUBLICADO,
      dataAgendada: new Date("2025-06-05"),
      criadoPorId: ti.id,
    },
    {
      titulo: "Hemograma completo: o que os resultados revelam",
      pilar: "Educacao em Saude",
      baseNormativa: null,
      textoArte: "Entenda o que e hemograma",
      legenda: "O hemograma e um dos exames mais solicitados e revela muito sobre a sua saude. Confira o que cada resultado significa.",
      hashtags: "#hemograma #exameslaboratoriais #saude #laboratorio",
      promptImagem: "Infografico moderno com icones de gota de sangue, fundo branco e teal, tipografia limpa",
      status: StatusPost.APROVADO,
      dataAgendada: new Date("2025-06-12"),
      criadoPorId: ti.id,
    },
    {
      titulo: "Analise de agua: proteja sua familia",
      pilar: "Qualidade",
      baseNormativa: "Portaria GM/MS 888/2021",
      textoArte: "Voce sabe a qualidade da sua agua?",
      legenda: "Realizamos analises microbiologicas e fisico-quimicas de agua para consumo. Garanta a segurança da sua familia.",
      hashtags: "#analisedeagua #qualidade #laboratorioambiental #segurancaalimentar",
      promptImagem: "Copo de agua cristalina ao lado de tubos de ensaio em laboratorio, fundo neutro, tons azul e teal",
      status: StatusPost.REVISAO,
      dataAgendada: new Date("2025-06-19"),
      criadoPorId: ti.id,
    },
    {
      titulo: "Resultados online em ate 24h",
      pilar: "Institucional",
      baseNormativa: null,
      textoArte: "Resultados rapidos e seguros",
      legenda: "Acesse seus resultados de exame de qualquer lugar, a qualquer hora. Praticidade que voce merece.",
      hashtags: "#laboratorio #resultadosonline #tecnologia #saude",
      promptImagem: "Pessoa acessando resultados no smartphone, interface moderna, cores teal e branca",
      status: StatusPost.REVISAO,
      dataAgendada: new Date("2025-06-26"),
      criadoPorId: diretor.id,
    },
    {
      titulo: "Perfil lipidico: conheca seus indices",
      pilar: "Educacao em Saude",
      baseNormativa: null,
      textoArte: "Colesterol e triglicerideos sob controle",
      legenda: "Manter o controle do colesterol e fundamental para a saude cardiovascular. Saiba como interpretar seus resultados.",
      hashtags: "#colesterol #perfilipidico #saudecardiovascular #prevencao",
      promptImagem: "Coracao estilizado com graficos de linha, fundo branco, cores teal e cinza, visual moderno",
      status: StatusPost.RASCUNHO,
      dataAgendada: new Date("2025-07-03"),
      criadoPorId: ti.id,
    },
    {
      titulo: "Aniversario do laboratorio",
      pilar: "Institucional",
      baseNormativa: null,
      textoArte: "15 anos cuidando da sua saude",
      legenda: "Celebramos 15 anos de historia, qualidade e compromisso com a saude da nossa comunidade. Obrigado pela confiança!",
      hashtags: "#aniversario #15anos #laboratorio #obrigado",
      promptImagem: "Comemoracao com bolo e numero 15, cores institucionais teal e cinza, ambiente de laboratorio ao fundo",
      status: StatusPost.RASCUNHO,
      dataAgendada: new Date("2025-07-10"),
      criadoPorId: diretor.id,
    },
    {
      titulo: "Exames para check-up anual",
      pilar: "Promocoes",
      baseNormativa: null,
      textoArte: "Pacote check-up com desconto especial",
      legenda: "Cuide da sua saude de forma completa. Nosso pacote check-up inclui os principais exames preventivos com condicoes especiais.",
      hashtags: "#checkup #prevencao #saudeemdia #laboratorio",
      promptImagem: "Lista de exames em prancheta, medico sorrindo, fundo teal claro, icones de saude",
      status: StatusPost.RASCUNHO,
      dataAgendada: new Date("2025-07-17"),
      criadoPorId: ti.id,
    },
    {
      titulo: "Controle de qualidade acreditado",
      pilar: "Qualidade",
      baseNormativa: "ABNT NBR ISO 15189:2022",
      textoArte: "Acreditacao que garante precisao",
      legenda: "Nossos processos seguem os mais rigorosos padroes internacionais de qualidade. Confiabilidade em cada resultado.",
      hashtags: "#qualidade #acreditacao #ISO15189 #laboratorio",
      promptImagem: "Selos de acreditacao e certificacao, microscopio, fundo branco com detalhes teal, visual corporativo",
      status: StatusPost.RASCUNHO,
      dataAgendada: new Date("2025-07-24"),
      criadoPorId: diretor.id,
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });

    await prisma.historico.create({
      data: {
        postId: post.id,
        autorId: postData.criadoPorId,
        campo: "status",
        valorAntigo: null,
        valorNovo: post.status,
      },
    });

    if (post.status === StatusPost.PUBLICADO) {
      await prisma.comentario.create({
        data: {
          postId: post.id,
          autorId: diretor.id,
          texto: "Post publicado com excelente engajamento. Manter este formato.",
        },
      });
    }
  }

  console.log(`Seed concluido: 2 usuarios, ${posts.length} posts.`);
  console.log("  ti@laboratorio.com  /  lab@2025");
  console.log("  diretor@laboratorio.com  /  lab@2025");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
