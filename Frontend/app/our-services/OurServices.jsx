"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./OurServices.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  mainHeader: "Custom & Personalised Jewellery Design, Remaking & Resizing Services",
  introCards: [
    {
      title: "Custom Jewellery & Personalised Design Services",
      text: "At Barosche, we believe jewellery should be as unique as the person wearing it. Our custom jewellery services allow you to create one-of-a-kind pieces that reflect your personal style and story. Whether you’re designing an engagement ring, a meaningful gift, or a statement accessory, you can choose from premium metals like 925 sterling silver, 9K, 14K, and 18K gold, along with a wide range of natural gemstones. Explore our collection of gemstone rings and minimalist pendants for inspiration before creating your custom design."
    },
    {
      title: "Birthstone Jewellery for Every Occasion",
      text: "Celebrate life’s special moments with our beautifully crafted birthstone jewellery. Each gemstone holds a unique meaning, making it a perfect choice for birthdays, anniversaries, or thoughtful gifts. From elegant November birthstone rings to timeless everyday pieces, our collection blends symbolism with modern design. Our expert artisans ensure every piece is crafted with precision, durability, and a luxurious finish."
    },
    {
      title: "Jewellery Remaking & Redesign Services",
      text: "Have old or heirloom jewellery you no longer wear? Our jewellery remaking and redesign services transform your existing pieces into modern, wearable designs while preserving their emotional value. Whether it’s upgrading a vintage ring or redesigning a family heirloom, we help you create something new without losing its story. You can also explore trending styles like vintage statement jewellery for redesign inspiration."
    },
    {
      title: "Ring Resizing & Professional Adjustments",
      text: "Finding the perfect fit is essential for comfort and style. Our ring resizing and adjustment services ensure your jewellery fits perfectly while maintaining its original craftsmanship and warranty protection. Whether it’s a slight size correction or a complete adjustment, our professionals handle each piece with care and precision."
    }
  ],
  detailBlocks: [
    {
      title: "Custom Jewellery Design – Exclusive Creations Made Just for You",
      paragraphs: [
        "Custom jewellery design is the foundation of truly personal luxury, where creativity meets craftsmanship to create pieces that are uniquely yours. Unlike mass-produced jewellery, custom design allows you to be involved in every step—from concept selection to final detailing—ensuring that the finished piece reflects your personality, emotions, and style preferences.",
        "At Barosche, custom jewellery design is not just a service; it is a creative journey. Every piece is carefully developed with attention to proportion, gemstone selection, metal quality, and finishing. Whether you want a minimal modern design or an intricate luxury piece, custom jewellery ensures exclusivity that cannot be replicated.",
        "This approach is ideal for individuals who want meaningful jewellery that carries personal significance, whether for daily wear, special occasions, or memorable milestones."
      ],
      subFeatures: [
        { title: "End-to-End Custom Design Process", desc: "From idea sketching to final polishing, every step is handled with precision and care." },
        { title: "Unique Jewellery Tailored to Your Vision", desc: "Each design is exclusive and crafted according to your personal requirements." },
        { title: "Premium Craftsmanship Standards", desc: "High-quality materials and expert finishing ensure long-lasting elegance." }
      ]
    },
    {
      title: "Custom Birthstone Jewellery – Personalized Designs with Deep Meaning",
      paragraphs: [
        "Custom birthstone jewellery combines emotional symbolism with artistic design, making each piece deeply meaningful and personal. Birthstones represent individual identity, personality traits, and life milestones, turning jewellery into more than just an accessory—it becomes a story you can wear.",
        "Each custom birthstone jewellery piece is designed to highlight the natural beauty of gemstones while ensuring a balanced and elegant design structure. Whether incorporated into rings or pendants, birthstones add emotional depth and personalization to every creation.",
        "This type of jewellery is especially popular for gifting purposes, as it reflects thoughtfulness, emotional connection, and personal significance."
      ],
      subFeatures: [
        { title: "Symbolic Birthstone Selection", desc: "Each gemstone is chosen based on meaning, month, or personal preference." },
        { title: "Elegant Custom Jewellery Styling", desc: "Designed to balance aesthetics with emotional value." },
        { title: "Ideal for Meaningful Gifting", desc: "Perfect for birthdays, anniversaries, and special celebrations." }
      ]
    },
    {
      title: "Personalised Gemstone Jewellery – A Reflection of Your Identity",
      paragraphs: [
        "Personalised gemstone jewellery offers a perfect blend of individuality and elegance, allowing you to create jewellery that truly represents your personality. Every gemstone carries unique energy, color significance, and emotional symbolism, making each piece distinct and meaningful.",
        "At Barosche, personalised gemstone jewellery is crafted by combining carefully selected stones with modern design aesthetics. This ensures that each piece is not only visually appealing but also deeply personal. Whether you prefer subtle elegance or bold statement jewellery, personalised gemstone designs offer complete creative freedom.",
        "These pieces are ideal for individuals who value exclusivity and want jewellery that tells a personal story."
      ],
      subFeatures: [
        { title: "Custom Gemstone Selection Freedom", desc: "Choose stones based on meaning, color, or aesthetic preference." },
        { title: "Modern & Artistic Jewellery Design", desc: "Contemporary styles that enhance gemstone beauty." },
        { title: "Emotionally Meaningful Creations", desc: "Each piece reflects personal stories and significance." }
      ]
    },
    {
      title: "Gold Birthstone Jewellery – Luxury Meets Personal Meaning",
      paragraphs: [
        "Gold birthstone jewellery is a sophisticated fusion of luxury craftsmanship and emotional personalization. Gold provides a timeless, elegant foundation, while birthstones add individuality and symbolic meaning. Together, they create jewellery pieces that are both visually stunning and emotionally valuable.",
        "This combination is ideal for those who appreciate fine jewellery with deeper significance. Gold birthstone jewellery can be worn daily or reserved for special occasions, offering versatility without compromising elegance.",
        "Each design is carefully structured to highlight both the brilliance of gold and the uniqueness of the selected gemstone."
      ],
      subFeatures: [
        { title: "Premium Gold Jewellery Finish", desc: "Elegant gold detailing enhances durability and visual appeal." },
        { title: "Personalized Birthstone Integration", desc: "Each gemstone adds emotional and symbolic value." },
        { title: "Perfect Balance of Luxury & Meaning", desc: "Combines high-end design with personal storytelling." }
      ]
    }
  ],
  whyChoose: {
    title: "Why Choose Our Custom Jewellery Services",
    paragraphs: [
      "Our custom jewellery services are designed to deliver a premium, personalized experience that transforms your ideas into beautifully crafted jewellery. We prioritize creativity, precision, and quality to ensure every piece meets the highest standards of craftsmanship.",
      "From consultation to final delivery, every stage of the process is handled with care and professionalism. Our team ensures that your vision is translated into a jewellery piece that reflects your personality and emotional story.",
      "Whether it is a simple design or a complex luxury creation, our focus remains on delivering jewellery that is timeless, meaningful, and uniquely yours."
    ],
    features: [
      { title: "Fully Personalized Jewellery Creation", desc: "Every piece is designed based on your unique requirements." },
      { title: "Expert Craftsmanship & Quality Control", desc: "Ensures durability, precision, and fine finishing." },
      { title: "Emotionally Driven Design Approach", desc: "Jewellery that reflects memories, milestones, and identity." }
    ]
  },
  process: {
    title: "How Our Custom Jewellery Process Works",
    paragraphs: [
      "Our custom jewellery process is designed to be simple, transparent, and customer-friendly. It allows you to share your ideas, refine your design, and receive a finished product that matches your expectations perfectly.",
      "We begin with understanding your requirements, followed by design development, approval, crafting, and final delivery. Every step is communicated clearly to ensure a smooth and satisfying experience."
    ],
    steps: [
      { num: "Step 1", title: "Share Your Design Idea", desc: "Provide inspiration, sketches, or preferences." },
      { num: "Step 2", title: "Design Development & Approval", desc: "We create and refine your jewellery concept." },
      { num: "Step 3", title: "Crafting & Delivery", desc: "Expert artisans bring your design to life and deliver it safely." }
    ]
  },
  orderOnline: {
    title: "Order Custom Jewellery Online – Simple, Secure & Convenient",
    paragraphs: [
      "Ordering custom jewellery online with Barosche is a seamless and convenient experience. Our digital process allows you to communicate your ideas, track progress, and receive your jewellery without hassle.",
      "We ensure secure communication, transparent updates, and safe delivery to make your experience smooth from start to finish. Whether you are ordering for yourself or for a loved one, our process is designed for ease and satisfaction."
    ],
    features: [
      { title: "Easy Online Customization Process", desc: "Submit your design requests in just a few steps." },
      { title: "Transparent Production Updates", desc: "Stay informed throughout the creation process." },
      { title: "Safe Packaging & Reliable Delivery", desc: "Ensures jewellery reaches you securely and on time." }
    ]
  },

  // ---------- NEW: "Fine Jewellery" dropdown content ----------
  fineJewellery: {
    dropdownTitle: "Fine Jewellery",
    sections: [
      { type: "h2", html: "Custom Jewellery Design – Create Jewellery That Tells Your Story" },
      { type: "p", html: 'Discover the art of <strong>custom jewellery design</strong>, where creativity meets craftsmanship to create pieces that are truly one of a kind. At Barosche, we specialize in designing jewellery that reflects your personality, emotions, and special moments. Whether you are looking for a meaningful gift, a symbolic keepsake, or a luxury statement piece, our custom jewellery services bring your imagination to life.' },
      { type: "p", html: 'Every piece is designed with precision, care, and attention to detail, ensuring it is not only beautiful but also deeply personal. From concept to final creation, we transform your ideas into elegant jewellery that you can cherish forever.' },

      { type: "h2", html: "Custom Jewellery Design Services – Crafted Just for You" },
      { type: "p", html: 'Our custom jewellery service allows you to be part of the creative journey. Whether you have a clear design in mind or just a rough idea, we help you turn it into a stunning reality.' },
      { type: "h4", html: "What We Offer:" },
      { type: "ul", items: [
        "Fully <strong>custom jewellery design</strong> from scratch",
        "Personalised adjustments to existing designs",
        "Custom engraving (names, initials, dates)",
        "Choice of gold, silver, and premium gemstone settings",
        "Bespoke designs for men and women",
        'Redesign of old or heirloom jewellery'
      ]},
      { type: "p", html: "Each design is carefully developed to match your style preferences, budget, and emotional significance." },

      { type: "h2", html: "Custom Birthstone Jewellery – A Personal Expression of Identity" },
      { type: "p", html: "Celebrate your birth month with beautifully crafted <strong>custom birthstone jewellery</strong> designed to reflect your personality and energy. Birthstones are believed to carry symbolic meanings, offering protection, strength, and emotional connection." },
      { type: "p", html: "Each birthstone piece is designed to highlight individuality while maintaining elegance and timeless appeal." },
      { type: "h4", html: 'Popular Birthstone Jewellery Ideas:' },
      { type: "ul", items: [
        "Birthstone pendants and necklaces",
        "Birthstone rings and bracelets",
        "Family birthstone combinations",
        "Couple and anniversary birthstone designs",
        'Minimal gold birthstone jewellery'
      ]},
      { type: "p", html: 'Whether worn daily or gifted to a loved one, birthstone jewellery adds a meaningful touch to every moment.' },

      { type: "h2", html: "Gold Birthstone Jewellery – Timeless Luxury with Meaning" },
      { type: "p", html: 'Our <strong>gold birthstone jewellery</strong> combines the richness of gold with the beauty of natural gemstones. This fusion creates jewellery that is both luxurious and emotionally significant.' },
      { type: "p", html: "Gold enhances the brilliance of each stone, making every piece stand out with elegance and charm. These designs are perfect for both everyday wear and special occasions." },
      { type: "h4", html: 'Why Choose Gold Birthstone Jewellery:' },
      { type: "ul", items: [
        "Premium and long-lasting craftsmanship",
        "Elegant combination of gold and gemstones",
        "Suitable for daily wear and gifting",
        "Symbolic and meaningful design concept",
        "Perfect for festive and special occasions"
      ]},

      { type: "h2", html: "Personalized Gemstone Jewellery – Designed Around You" },
      { type: "p", html: 'Express your individuality with <strong>personalised gemstone jewellery</strong> that reflects your story, personality, and style. Each gemstone carries unique energy, color, and meaning, making your jewellery truly special.' },
      { type: "p", html: 'From soft pastel tones to vibrant statement stones, gemstone jewellery allows endless customization possibilities.' },
      { type: "h4", html: "Customization Options:" },
      { type: "ul", items: [
        "Choice of natural or semi-precious gemstones",
        "Custom cuts, shapes, and settings",
        "Minimal or bold design styles",
        "Gold, silver, or mixed metal options",
        "Engraved personalization for emotional value"
      ]},
      { type: "p", html: "Every gemstone piece is designed to be unique—just like you." },

      { type: "h2", html: "Gold Birthstone Jewellery for Women – Elegant & Meaningful Designs" },
      { type: "p", html: 'Our <strong>gold birthstone jewellery for women</strong> is designed to combine femininity, elegance, and emotional symbolism. These pieces are perfect for women who love jewellery that is both stylish and meaningful.' },
      { type: "p", html: "Whether it's a delicate pendant or a statement ring, each design enhances natural beauty while reflecting personal identity." },
      { type: "h4", html: "Ideal For:" },
      { type: "ul", items: [
        "Everyday elegant wear",
        "Birthday and anniversary gifts",
        "Personal milestone celebrations",
        "Festive and cultural occasions"
      ]},

      { type: "h2", html: 'Why Choose Custom Jewellery Design?' },
      { type: "p", html: 'Custom jewellery is more than just an accessory—it is a personal expression of emotion and creativity.' },
      { type: "h4", html: "Key Benefits:" },
      { type: "ul", items: [
        "Completely unique and one-of-a-kind designs",
        "Emotional and sentimental value",
        "Full control over materials and style",
        "Perfect fit for personal taste and budget",
        "Ideal for gifting and special occasions"
      ]},
      { type: "p", html: 'Unlike mass-produced jewellery, custom designs allow you to create something that truly belongs to you.' },

      { type: "h2", html: "Our Custom Jewellery Design Process" },
      { type: "p", html: "We follow a simple and transparent process to bring your ideas to life:" },
      { type: "h3", html: "1. Share Your Idea" },
      { type: "p", html: "Tell us your vision, inspiration, or reference design." },
      { type: "h3", html: "2. Design Development" },
      { type: "p", html: "Our experts create sketches and design concepts based on your idea." },
      { type: "h3", html: "3. Material Selection" },
      { type: "p", html: "Choose from gold, gemstones, and premium finishes." },
      { type: "h3", html: "4. Final Crafting" },
      { type: "p", html: 'Your jewellery is carefully crafted with precision and quality assurance.' },

      { type: "h2", html: "Birthstone Jewellery Meaning & Significance" },
      { type: "p", html: 'Each birthstone represents unique qualities and energies, making jewellery more meaningful and personal.' },
      { type: "ul", items: [
        "Adds emotional connection to jewellery",
        "Represents personality traits and identity",
        "Brings symbolic and cultural value",
        "Makes gifting more thoughtful and memorable"
      ]},

      { type: "h2", html: "Styling Tips for Custom & Birthstone Jewellery" },
      { type: "ul", items: [
        "Pair minimal birthstone pendants with daily outfits",
        "Layer gemstone necklaces for modern styling",
        "Wear gold birthstone rings as statement pieces",
        "Match gemstone colors with outfits for harmony",
        "Combine custom jewellery with minimal accessories"
      ]},

      { type: "h2", html: "Custom Jewellery as a Perfect Gift" },
      { type: "p", html: 'Custom jewellery is one of the most meaningful gift choices for loved ones. It carries emotions, memories, and personal connection.' },
      { type: "h4", html: "Perfect For:" },
      { type: "ul", items: ["Birthdays", "Anniversaries", "Weddings", "Festivals", "Personal milestones"] },
      { type: "p", html: "A custom piece becomes a lifelong memory that can be cherished forever." },

      { type: "h2", html: "Why Choose Our Custom Jewellery Services" },
      { type: "p", html: 'We focus on quality, creativity, and personalization to deliver an exceptional <a href="/product-category/jewellery/">fine jewellery online</a> experience:' },
      { type: "ul", items: [
        "Expert craftsmanship with attention to detail",
        "Fully personalised jewellery solutions",
        "Premium gold and gemstone quality",
        "Trend-inspired yet timeless designs",
        "Perfect balance of luxury and meaning"
      ]},
      { type: "p", html: "Every piece is designed to reflect your individuality with elegance." }
    ]
  },

  // ---------- NEW: "Frequently Asked Questions" dropdown content ----------
  faqDropdown: {
    dropdownTitle: "Frequently Asked Questions",
    title: "Frequently Asked Questions",
    faqs: [
      { q: "1. What is custom jewellery design?", a: "Custom jewellery design is a service where jewellery is created based on your personal ideas, style, and preferences." },
      { q: "2. Can I design my own jewellery online?", a: "Yes, you can share your design idea, and we create a fully customized jewellery piece for you." },
      { q: "3. What is birthstone jewellery?", a: "Birthstone jewellery features gemstones associated with a person's birth month, each carrying symbolic meaning." },
      { q: "4. Is custom jewellery more expensive than ready-made jewellery?", a: "It depends on design, materials, and gemstones, but it is often more personalized and value-driven." },
      { q: "5. What materials are used in custom jewellery?", a: "We use gold, silver, stainless steel, and premium gemstones depending on your selection." },
      { q: "6. Can I choose my own gemstone for jewellery?", a: "Yes, you can select gemstones based on color, meaning, or personal preference." },
      { q: "7. What is personalised gemstone jewellery?", a: "It is jewellery designed specifically for you using selected gemstones and custom design elements." },
      { q: "8. Is gold used in birthstone jewellery?", a: "Yes, gold is commonly used to enhance the beauty and value of birthstone jewellery." },
      { q: "9. Can I add engraving to custom jewellery?", a: "Yes, you can add names, initials, dates, or meaningful messages." },
      { q: "10. Is birthstone jewellery suitable for gifting?", a: "Yes, it is one of the most meaningful and personalized gift options." },
      { q: "11. How do I choose the right birthstone?", a: "Birthstones are selected based on your birth month or personal preference." },
      { q: "12. Can I redesign old jewellery into new designs?", a: "Yes, old jewellery can be redesigned into modern custom pieces." },
      { q: "13. How long does custom jewellery take to make?", a: "Production time depends on design complexity and material selection." },
      { q: "14. Are gemstone meanings important?", a: "Many customers choose gemstones based on their symbolic or emotional significance." },
      { q: "15. Can I request a unique jewellery design?", a: "Yes, every custom jewellery piece is designed uniquely based on your idea." },
      { q: "16. Is custom jewellery durable?", a: "Yes, it is made using high-quality materials and professional craftsmanship." },
      { q: "17. Can I order matching jewellery sets?", a: "Yes, matching rings, pendants, and bracelets can be designed." },
      { q: "18. What occasions is custom jewellery best for?", a: "It is perfect for birthdays, weddings, anniversaries, and personal milestones." },
      { q: "19. Can I preview my jewellery before final production?", a: "Yes, design previews or sketches are shared before final creation." },
      { q: "20. Why should I choose custom jewellery over ready-made pieces?", a: "Custom jewellery offers uniqueness, emotional value, and a personal connection that ready-made jewellery cannot match." }
    ]
  }
};

const flattenContent = (content) => {
  const flat = [];
  flat.push(content.mainHeader);

  content.introCards.forEach((c) => {
    flat.push(c.title);
    flat.push(c.text);
  });

  content.detailBlocks.forEach((b) => {
    flat.push(b.title);
    b.paragraphs.forEach((p) => flat.push(p));
    b.subFeatures.forEach((sf) => {
      flat.push(sf.title);
      flat.push(sf.desc);
    });
  });

  flat.push(content.whyChoose.title);
  content.whyChoose.paragraphs.forEach((p) => flat.push(p));
  content.whyChoose.features.forEach((f) => {
    flat.push(f.title);
    flat.push(f.desc);
  });

  flat.push(content.process.title);
  content.process.paragraphs.forEach((p) => flat.push(p));
  content.process.steps.forEach((s) => {
    flat.push(s.num);
    flat.push(s.title);
    flat.push(s.desc);
  });

  flat.push(content.orderOnline.title);
  content.orderOnline.paragraphs.forEach((p) => flat.push(p));
  content.orderOnline.features.forEach((f) => {
    flat.push(f.title);
    flat.push(f.desc);
  });

  // Fine Jewellery dropdown
  flat.push(content.fineJewellery.dropdownTitle);
  content.fineJewellery.sections.forEach((sec) => {
    if (sec.type === "ul") {
      sec.items.forEach((it) => flat.push(it));
    } else {
      flat.push(sec.html);
    }
  });

  // FAQ dropdown
  flat.push(content.faqDropdown.dropdownTitle);
  flat.push(content.faqDropdown.title);
  content.faqDropdown.faqs.forEach((f) => {
    flat.push(f.q);
    flat.push(f.a);
  });

  return flat;
};

const rebuildContent = (translations) => {
  let i = 0;
  const get = () => translations[i++];

  const mainHeader = get();

  const introCards = DEFAULT_CONTENT.introCards.map(() => ({
    title: get(),
    text: get()
  }));

  const detailBlocks = DEFAULT_CONTENT.detailBlocks.map((b) => {
    const title = get();
    const paragraphs = b.paragraphs.map(() => get());
    const subFeatures = b.subFeatures.map(() => ({
      title: get(),
      desc: get()
    }));
    return { title, paragraphs, subFeatures };
  });

  const whyChooseTitle = get();
  const whyChooseParagraphs = DEFAULT_CONTENT.whyChoose.paragraphs.map(() => get());
  const whyChooseFeatures = DEFAULT_CONTENT.whyChoose.features.map(() => ({
    title: get(),
    desc: get()
  }));
  const whyChoose = { title: whyChooseTitle, paragraphs: whyChooseParagraphs, features: whyChooseFeatures };

  const processTitle = get();
  const processParagraphs = DEFAULT_CONTENT.process.paragraphs.map(() => get());
  const processSteps = DEFAULT_CONTENT.process.steps.map(() => ({
    num: get(),
    title: get(),
    desc: get()
  }));
  const process = { title: processTitle, paragraphs: processParagraphs, steps: processSteps };

  const orderOnlineTitle = get();
  const orderOnlineParagraphs = DEFAULT_CONTENT.orderOnline.paragraphs.map(() => get());
  const orderOnlineFeatures = DEFAULT_CONTENT.orderOnline.features.map(() => ({
    title: get(),
    desc: get()
  }));
  const orderOnline = { title: orderOnlineTitle, paragraphs: orderOnlineParagraphs, features: orderOnlineFeatures };

  const fineDropdownTitle = get();
  const fineSections = DEFAULT_CONTENT.fineJewellery.sections.map((sec) => {
    if (sec.type === "ul") {
      return { type: "ul", items: sec.items.map(() => get()) };
    }
    return { type: sec.type, html: get() };
  });
  const fineJewellery = { dropdownTitle: fineDropdownTitle, sections: fineSections };

  const faqDropdownTitle = get();
  const faqTitle = get();
  const faqs = DEFAULT_CONTENT.faqDropdown.faqs.map(() => ({
    q: get(),
    a: get()
  }));
  const faqDropdown = { dropdownTitle: faqDropdownTitle, title: faqTitle, faqs };

  return {
    mainHeader,
    introCards,
    detailBlocks,
    whyChoose,
    process,
    orderOnline,
    fineJewellery,
    faqDropdown
  };
};

// Renders a single "section" object from the Fine Jewellery dropdown
const renderSection = (sec, idx) => {
  switch (sec.type) {
    case "h2":
      return <h2 key={idx} dangerouslySetInnerHTML={{ __html: sec.html }} />;
    case "h3":
      return <h3 key={idx} dangerouslySetInnerHTML={{ __html: sec.html }} />;
    case "h4":
      return <h4 key={idx} className="fj-subheading" dangerouslySetInnerHTML={{ __html: sec.html }} />;
    case "ul":
      return (
        <ul key={idx}>
          {sec.items.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    case "p":
    default:
      return <p key={idx} dangerouslySetInnerHTML={{ __html: sec.html }} />;
  }
};

const ServicesPage = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [translationStatus, setTranslationStatus] = useState("idle");

  // Which top-level accordion/dropdown is open ("fine" | "faq" | null)
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const translateContent = useCallback(async () => {
    try {
      setTranslationStatus("loading");

      const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
      const detectData = await detectRes.json();

      if (!detectData.success) throw new Error("Language detection failed");

      const { languageCode, languageName } = detectData;
      setDetectedLanguage({ code: languageCode, name: languageName });

      if (languageCode === "en") {
        setTranslationStatus("done");
        return;
      }

      const allStrings = flattenContent(DEFAULT_CONTENT);

      const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: allStrings,
          targetLanguage: languageCode,
          sourceLanguage: "en",
        }),
      });

      const translateData = await translateRes.json();
      if (!translateData.success) throw new Error("Translation failed");

      const translatedContent = rebuildContent(translateData.translations);
      setContent(translatedContent);
      setTranslationStatus("done");
    } catch (err) {
      console.error("Auto-translate error:", err.message);
      setTranslationStatus("error");
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      translateContent();
    });
  }, [translateContent]);

  return (
    <>
      <div className="services-container">
        {/* Loading Bar Setup */}
        {translationStatus === "loading" && (
          <div className="translation-loading-bar" aria-hidden="true" />
        )}

        {/* Main Header */}
        <header className="services-main-header">
          <h1>{content.mainHeader}</h1>
        </header>

        {/* Intro Section */}
        <section className="services-intro-grid">
          {content.introCards.map((card, index) => (
            <div key={index} className="intro-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </div>
          ))}
        </section>

        {/* Main Features */}
        <section className="services-detail-section">
          {content.detailBlocks.map((block, bIndex) => (
            <div key={bIndex} className="detail-block">
              <h2>{block.title}</h2>
              {block.paragraphs.map((para, pIndex) => (
                <p key={pIndex}>{para}</p>
              ))}

              <div className="sub-features-grid">
                {block.subFeatures.map((sf, sfIndex) => (
                  <div key={sfIndex}>
                    <h3>{sf.title}</h3>
                    <p>{sf.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-section">
          <h2>{content.whyChoose.title}</h2>
          {content.whyChoose.paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}

          <div className="why-grid">
            {content.whyChoose.features.map((feat, index) => (
              <div key={index}>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="process-section">
          <h2>{content.process.title}</h2>
          {content.process.paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}

          <div className="steps-container">
            {content.process.steps.map((step, index) => (
              <div key={index} className="step-card">
                <span className="step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Order Online Section */}
        <section className="order-online-section">
          <h2>{content.orderOnline.title}</h2>
          {content.orderOnline.paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}

          <div className="why-grid">
            {content.orderOnline.features.map((feat, index) => (
              <div key={index}>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= NEW: 2 Dropdown / Accordion Section ================= */}
        <section className="accordion-section">
          {/* Dropdown 1: Fine Jewellery */}
          <div className={`accordion-item ${openAccordion === "fine" ? "open" : ""}`}>
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleAccordion("fine")}
              aria-expanded={openAccordion === "fine"}
            >
              <span className="accordion-arrow">▸</span>
              <span className="accordion-title">{content.fineJewellery.dropdownTitle}</span>
            </button>

            <div className="accordion-panel">
              <div className="accordion-panel-inner fine-jewellery-content">
                {content.fineJewellery.sections.map((sec, idx) => renderSection(sec, idx))}
              </div>
            </div>
          </div>

          {/* Dropdown 2: Frequently Asked Questions */}
          <div className={`accordion-item ${openAccordion === "faq" ? "open" : ""}`}>
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleAccordion("faq")}
              aria-expanded={openAccordion === "faq"}
            >
              <span className="accordion-arrow">▸</span>
              <span className="accordion-title">{content.faqDropdown.dropdownTitle}</span>
            </button>

            <div className="accordion-panel">
              <div className="accordion-panel-inner">
                <div className="faq-list">
                  {content.faqDropdown.faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h3 className="faq-question">{faq.q}</h3>
                      <p className="faq-answer">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default ServicesPage;