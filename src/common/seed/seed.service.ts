import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { MetodoPago } from '../../metodosPago/entities/metodo-pago.entity';
import { Setting } from '../../settings/entities/setting.entity';
import { Reservation, ReservationStatus, PaymentStatus } from '../../reservations/entities/reservation.entity';
import { MediaPost, PostStatus } from '../../media-posts/entities/media-post.entity';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(MediaPost)
    private readonly mediaPostRepository: Repository<MediaPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async runSeed() {
    this.logger.log('Iniciando Seeder...');
    await this.seedUsers();
    await this.seedSettings();
    await this.seedServicios();
    await this.seedMetodosPago();
    await this.seedReservations();
    await this.seedMediaPosts();
    this.logger.log('Seeder completado exitosamente.');
  }

  private async seedUsers() {
    const adminEmail = 'admin@milesvisual.com';
    const existing = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        nombre: 'Admin Miles Visual',
        username: 'admin',
        email: adminEmail,
        password_hash: hashedPassword,
        rol: 'admin',
      });
      await this.userRepository.save(admin);
    }
  }

  private async seedSettings() {
    const settings = [
      // SEO
      { key: 'seo_title', value: 'Miles Visual | Fotografía Editorial', description: 'Título de la página' },
      { key: 'seo_description', value: 'Estudio de fotografía especializado en bodas, prebodas y fotografía editorial. Capturamos momentos eternos.', description: 'Meta descripción' },

      // HERO
      { key: 'hero_title', value: 'FOTOS SOÑADAS', description: 'Título principal de la portada' },
      { key: 'hero_subtitle', value: 'HAGAMOS DE TUS', description: 'Subtítulo del Hero' },
      { key: 'hero_description', value: 'Fotografía y audiovisual con una mirada editorial, emocional y cinematográfica para parejas que quieren recuerdos que realmente se sientan.', description: 'Texto descriptivo del Hero' },

      // BIENVENIDA
      { key: 'welcome_title', value: 'UNA EXPERIENCIA VISUAL QUE SE SIENTE', description: 'Título de bienvenida' },
      { key: 'welcome_text', value: 'Cada historia merece una estética cuidada, una dirección sensible y una experiencia que conecte desde el primer vistazo hasta la última entrega.', description: 'Texto de bienvenida' },

      // ACERCA DE MI
      { key: 'about_title', value: 'HISTORIAS REALES, MIRADA EDITORIAL', description: 'Título de Acerca de mí' },
      { key: 'about_text_1', value: 'Soy Miles, fotógrafo y productor audiovisual. Mi trabajo nace de la sensibilidad, la estética y la intención de transformar cada momento en una pieza visual con emoción, carácter y presencia.', description: 'Párrafo 1 de biografía' },
      { key: 'about_text_2', value: 'Me interesa crear imágenes que no solo se vean hermosas, sino que también transmitan verdad, atmósfera y una experiencia memorable desde el primer contacto.', description: 'Párrafo 2 de biografía' },

      // SECCIONES
      { key: 'bodas_desc', value: 'Coberturas con una mirada elegante, emocional y cinematográfica para contar tu historia con belleza, sensibilidad y verdad.', description: 'Descripción sección Bodas' },
      { key: 'prebodas_desc', value: 'Sesiones íntimas y editoriales para parejas que quieren imágenes delicadas, naturales y con una narrativa visual especial.', description: 'Descripción sección Prebodas' },
      { key: 'estudio_desc', value: 'Retratos y piezas visuales con una propuesta limpia, refinada y pensada desde la estética, la dirección y el detalle.', description: 'Descripción sección Estudio' },

      // CONTACTO
      { key: 'contact_email', value: 'hola@milesvisual.com', description: 'Email de contacto' },
      { key: 'contact_phone', value: '573148112717', description: 'WhatsApp' },
      { key: 'instagram_url', value: 'https://instagram.com/milesvisual', description: 'Instagram' },
      { key: 'whatsapp_number', value: '573148112717', description: 'Número de WhatsApp para cotizaciones' },

      // RECURSOS MULTIMEDIA (CLOUDINARY)
      { key: 'hero_video_url', value: 'https://res.cloudinary.com/dgfp5gcjr/video/upload/v1777429058/VIDEO_1_1_b0wg0m.mp4', description: 'Video principal del inicio' },
      { key: 'middle_video_url', value: 'https://res.cloudinary.com/dgfp5gcjr/video/upload/v1778000231/VIDEO_2_1_ggrrzq.mp4', description: 'Video intermedio de la página' },
      { key: 'about_image_1', value: 'https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777471870/WhatsApp_Image_2026-04-13_at_12.24.20_PM_1_tooe7y.jpg', description: 'Imagen superior de Acerca de Mí' },
      { key: 'about_image_2', value: 'https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777471868/WhatsApp_Image_2026-04-13_at_12.24.19_PM_qibzhs.jpg', description: 'Imagen inferior de Acerca de Mí' },
      { key: 'about_video_url', value: 'https://res.cloudinary.com/dgfp5gcjr/video/upload/v1777429150/VIDEO_4_1_v0pinj.mp4', description: 'Video de la sección nosotros' },
      { key: 'about_title_top', value: '¿QUIÉNES', description: 'Título superior sección nosotros' },
      { key: 'about_title_bottom', value: 'SOMOS?', description: 'Título inferior (script) sección nosotros' },
    ];

    for (const s of settings) {
      let existing = await this.settingRepository.findOne({ where: { key: s.key } });
      if (existing) {
        // Actualizamos el valor si ya existe para asegurar que tenga la URL correcta
        existing.value = s.value;
        await this.settingRepository.save(existing);
      } else {
        await this.settingRepository.save(s);
      }
    }
  }

  private async seedServicios() {
    const servicios = [
      // BODAS
      {
        nombre: 'Basic', slug: 'bodas-basic', precio_base: 1500000, duracion: 600,
        categoria: 'BODAS', subtitulo: 'Fotografía', destacado: true, imagen_url: 'https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120054/5_d4xktj.jpg',
        descripcion: JSON.stringify([
          "5 fotos impresas tamaño 15x20 cm",
          "Cubrimiento del evento en formato digital (aprox. 200 fotos)",
          "USB con el material del evento",
          "Protocolo, decoración, recepción, maquillaje y hora loca"
        ])
      },
      {
        nombre: 'Clasic', slug: 'bodas-clasic', precio_base: 1850000, duracion: 600,
        categoria: 'BODAS', subtitulo: 'Fotografía', destacado: true, imagen_url: 'https://i.pinimg.com/1200x/44/0a/be/440abe02ff2cff0f6fce3b0ed3a41e0a.jpg',
        descripcion: JSON.stringify([
          "10 fotos impresas tamaño 15x20 cm",
          "Photobook 30x30 cm (5 hojas con 30 fotos plasmadas)",
          "Cubrimiento del evento en formato digital (aprox. 300 fotos)",
          "USB con el material del evento",
          "Decoración, recepción, maquillaje y hora loca"
        ])
      },
      {
        nombre: 'Premium', slug: 'bodas-premium', precio_base: 2400000, duracion: 600,
        categoria: 'BODAS', subtitulo: 'Fotografía', destacado: true, imagen_url: 'https://i.pinimg.com/736x/d1/8e/e2/d18ee24424e28b9caa7a2b53313987f4.jpg',
        descripcion: JSON.stringify([
          "15 fotos impresas tamaño 15x20 cm",
          "Photobook 30x30 cm (10 hojas con 70 fotos plasmadas)",
          "Cubrimiento del evento en formato digital (aprox. 400 fotos)",
          "USB con el material del evento",
          "Decoración, recepción, maquillaje y hora loca"
        ])
      },
      {
        nombre: 'Diamante', slug: 'bodas-diamante', precio_base: 2850000, duracion: 600,
        categoria: 'BODAS', subtitulo: 'Foto + Video', destacado: true, imagen_url: 'https://i.pinimg.com/736x/f7/c7/4b/f7c74bbf0fc3ffc1fe7b318f4a3140a8.jpg',
        video_url: 'VIDEO 5.mp4',
        descripcion: JSON.stringify([
          "Pre boda",
          "20 fotos impresas tamaño 15x20 cm",
          "Photobook 30x30 cm (15 hojas con 90 fotos plasmadas)",
          "Cubrimiento del evento en formato digital",
          "USB con todo el material del evento",
          "Video clip"
        ])
      },
      {
        nombre: 'Gold', slug: 'bodas-gold', precio_base: 3600000, duracion: 600,
        categoria: 'BODAS', subtitulo: 'Experiencia completa', destacado: true, imagen_url: 'https://i.pinimg.com/1200x/5f/c7/4a/5fc74aa29aba24b0b0d348c52b19f4e6.jpg',
        descripcion: JSON.stringify([
          "Pre boda",
          "15 fotos impresas tamaño 15x20 cm",
          "Photobook 15x20 cm (5 hojas con 30 fotos plasmadas)",
          "Photobook 30x30 cm (18 hojas con 100 fotos plasmadas)",
          "USB con todo el material del evento",
          "Tomas de dron",
          "Video de tus sueños"
        ])
      },
      // PRE-BODAS
      {
        nombre: 'Basic', slug: 'prebodas-basic', precio_base: 1500000, duracion: 600,
        categoria: 'PREBODAS', subtitulo: 'Sesión íntima', destacado: true, imagen_url: '/prebodas/WhatsApp Image 2026-04-08 at 5.01.08 PM.jpeg',
        descripcion: JSON.stringify([
          "5 fotos impresas tamaño 15x20 cm",
          "Cubrimiento del evento en formato digital",
          "USB con el material del evento",
          "Protocolo, decoración, recepción"
        ])
      },
      {
        nombre: 'Clasic', slug: 'prebodas-clasic', precio_base: 1850000, duracion: 600,
        categoria: 'PREBODAS', subtitulo: 'Clásico', destacado: true, imagen_url: '/prebodas/WhatsApp Image 2026-04-08 at 5.01.09 PM (1).jpeg',
        descripcion: JSON.stringify([
          "10 fotos impresas tamaño 15x20 cm",
          "Photobook 30x30 cm",
          "USB con material del evento",
          "Maquillaje y hora loca"
        ])
      },
      // ESTUDIO
      {
        nombre: 'Editorial', slug: 'estudio-editorial', precio_base: 850000, duracion: 120,
        categoria: 'ESTUDIO', subtitulo: 'Foto Estudio', destacado: true, imagen_url: 'https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777916405/DSC00984.jpg-squished_1_gh5xpb.jpg',
        descripcion: JSON.stringify([
          "Sesión en estudio con dirección visual",
          "Selección de fotos editadas en alta calidad",
          "Concepto estético definido",
          "Entrega digital curada"
        ])
      }
    ];

    for (const s of servicios) {
      const existing = await this.servicioRepository.findOne({ where: { slug: s.slug } });
      if (existing) {
        await this.servicioRepository.update(existing.id, s);
      } else {
        await this.servicioRepository.save(this.servicioRepository.create(s));
      }
    }
  }

  private async seedMediaPosts() {
    await this.mediaPostRepository.clear();


    const posts = [
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778118632/1_icimdx.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778118811/2_b0wn6p.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120052/6_cvfner.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120052/4_nfyvww.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120052/8_iashwf.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120052/3_uaqeks.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120054/5_d4xktj.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1778120055/9_tauymh.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777917067/982A2258.jpg_2_-squished_knjv9s.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A2623.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A2679.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A5011.jpg (1).jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A5399.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/milesvisual/public/Bodas/982A5506.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777917067/982A2258.jpg_2_-squished_knjv9s.jpg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A5399.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Ceremonia editorial`, category: 'BODAS', cloudinaryUrl: `/Bodas/982A5506.jpg.jpeg`, cloudinaryPublicId: `Una cobertura pensada para capturar la ceremonia con elegancia, atmósfera y detalle, resaltando la emoción real del momento.`, status: PostStatus.PUBLISHED },
      { title: `Conexión auténtica`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.08 PM.jpeg`, cloudinaryPublicId: `Sesiones pensadas para retratar la complicidad real de la pareja con una atmósfera íntima y elegante.`, status: PostStatus.PUBLISHED },
      { title: `Preludio visual`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.09 PM (1).jpeg`, cloudinaryPublicId: `Un lenguaje visual más editorial para contar el antes del gran día desde una estética más sensible y cinematográfica.`, status: PostStatus.PUBLISHED },
      { title: `Luz y movimiento`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.09 PM (2).jpeg`, cloudinaryPublicId: `La dirección de luz, la postura y el movimiento construyen imágenes espontáneas pero visualmente refinadas.`, status: PostStatus.PUBLISHED },
      { title: `Paisaje emocional`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.09 PM (3).jpeg`, cloudinaryPublicId: `Integramos locación y emoción para que el entorno también sea parte de la historia visual.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.10 PM (2).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.11 PM (1).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.11 PM (2).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.12 PM (1).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.12 PM.jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.13 PM.jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.14 PM (1).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.14 PM (2).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.14 PM.jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.15 PM (1).jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Recuerdo previo`, category: 'PREBODAS', cloudinaryUrl: `/prebodas/WhatsApp Image 2026-04-08 at 5.01.15 PM.jpeg`, cloudinaryPublicId: `Una sesión previa que no solo documenta, sino que construye una memoria poderosa antes de la boda.`, status: PostStatus.PUBLISHED },
      { title: `Editorial clean`, category: 'ESTUDIO', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777916405/DSC00984.jpg-squished_1_gh5xpb.jpg`, cloudinaryPublicId: `Una propuesta visual limpia, con dirección de pose, luz precisa y una atmósfera sofisticada para retratos de alto impacto.`, status: PostStatus.PUBLISHED },
      { title: `Editorial clean`, category: 'ESTUDIO', cloudinaryUrl: `https://res.cloudinary.com/dgfp5gcjr/image/upload/v1777916404/DSC09548.jpg-squished_n5huzj.jpg`, cloudinaryPublicId: `Una propuesta visual limpia, con dirección de pose, luz precisa y una atmósfera sofisticada para retratos de alto impacto.`, status: PostStatus.PUBLISHED },
      { title: `Editorial clean`, category: 'ESTUDIO', cloudinaryUrl: `/estudio/WhatsApp Image 2026-04-13 at 12.24.20 PM (2).jpeg`, cloudinaryPublicId: `Una propuesta visual limpia, con dirección de pose, luz precisa y una atmósfera sofisticada para retratos de alto impacto.`, status: PostStatus.PUBLISHED },
      { title: `Editorial clean`, category: 'ESTUDIO', cloudinaryUrl: `/estudio/WhatsApp Image 2026-04-13 at 12.24.20 PM (2).jpeg`, cloudinaryPublicId: `Una propuesta visual limpia, con dirección de pose, luz precisa y una atmósfera sofisticada para retratos de alto impacto.`, status: PostStatus.PUBLISHED },
      { title: `Fashion portrait`, category: 'ESTUDIO', cloudinaryUrl: `/estudio/WhatsApp Image 2026-04-13 at 12.24.20 PM (3).jpeg`, cloudinaryPublicId: `Retratos con fuerza visual, pensados para marcas personales, modelos, influencers y perfiles con una identidad editorial.`, status: PostStatus.PUBLISHED },
      { title: `Studio mood`, category: 'ESTUDIO', cloudinaryUrl: `/estudio/WhatsApp Image 2026-04-13 at 12.24.21 PM (4).jpeg`, cloudinaryPublicId: `La iluminación y la composición crean una escena con textura, intención y una sensación visual mucho más artística.`, status: PostStatus.PUBLISHED },
      { title: `Persona y marca`, category: 'ESTUDIO', cloudinaryUrl: `/estudio/WhatsApp Image 2026-04-13 at 12.24.24 PM.jpeg`, cloudinaryPublicId: `Imágenes que construyen presencia digital, elegancia y un lenguaje visual propio para tu marca personal.`, status: PostStatus.PUBLISHED },
      { title: `Influencer session`, category: 'ESTUDIO', cloudinaryUrl: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80`, cloudinaryPublicId: `Contenido con intención estética para redes, campañas, branding personal o piezas visuales con acabado premium.`, status: PostStatus.PUBLISHED },
      { title: `Fine art portrait`, category: 'ESTUDIO', cloudinaryUrl: `https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1800&q=80`, cloudinaryPublicId: `Una mezcla de retrato, moda y dirección visual para crear imágenes con una presencia mucho más artística y memorable.`, status: PostStatus.PUBLISHED },
    ];

    for (const p of posts) {
      await this.mediaPostRepository.save(this.mediaPostRepository.create(p));
    }
  }

  private async seedMetodosPago() {
    const metodos = [
      { nombre: 'Bancolombia', descripcion: 'Transferencia directa', activo: true },
      { nombre: 'Zelle', descripcion: 'Pagos internacionales', activo: true },
    ];
    for (const m of metodos) {
      const existing = await this.metodoPagoRepository.findOne({ where: { nombre: m.nombre } });
      if (!existing) await this.metodoPagoRepository.save(m);
    }
  }

  private async seedReservations() {
    // Basic reservations to avoid errors if needed
  }
}
