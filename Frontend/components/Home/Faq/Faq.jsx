"use client";
import React, { useState, useEffect } from "react";
import "./Faq.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const INITIAL_ACCORDION_DATA = [
  {
    id: 1,
    title: "Fine Jewellery",
    blocks: [
      { tag: "h2", text: "Semi-Handmade Fine Jewellery, Diamond Jewellery & Luxury Accessories Online" },
      { tag: "p", text: "Welcome to Barosche– your trusted destination for premium <strong>semi-handmade jewellery</strong>, elegant <strong>fine jewellery</strong>, and timeless <strong>luxury accessories</strong> crafted for modern lifestyles. Our collections are thoughtfully designed to blend contemporary aesthetics with traditional craftsmanship, resulting in jewellery that feels sophisticated, unique, and effortlessly stylish." },
      { tag: "p", text: "At Barosche, we focus on creating pieces that go beyond trends. From refined detailing to high-quality finishes, every design reflects precision, balance, and long-lasting appeal. Our selection of <strong>fine jewellery online</strong> and <strong>diamond jewellery</strong> is curated to offer versatility, making it easy to style your look for both everyday wear and special occasions." },
      { tag: "p", text: "Whether you're looking to <strong>buy jewellery online </strong>for daily elegance or statement styling, Barosche offers a carefully curated range of <strong>rings, pendants, earrings, and bracelets</strong> that elevate your overall appearance. Designed with a minimalist approach and a luxury touch, each piece complements modern fashion while maintaining timeless charm." },
      { tag: "p", text: "With a strong focus on <strong>minimalist jewellery</strong> and <strong>minimalist luxury jewellery</strong>, our collections are ideal for those who appreciate subtle sophistication. From clean lines to elegant forms, every piece is created to enhance your style without overpowering it—making it perfect for layering, gifting, or building a refined jewellery collection." },
      { tag: "p", text: "Discover jewellery that combines craftsmanship, comfort, and contemporary design—all in one place." },

      { tag: "h2", text: "Discover Fine Jewellery & Diamond Jewellery Online" },
      { tag: "p", text: "Explore an exclusive range of <strong>fine jewellery online</strong> and stunning <strong>diamond jewellery</strong> that reflects precision, elegance, and exceptional craftsmanship. Each piece is thoughtfully designed to strike the perfect balance between luxury and everyday wearability, allowing you to express your style with confidence." },
      { tag: "p", text: "Our <strong>diamond jewellery </strong>collection is crafted to highlight brilliance, clarity, and timeless beauty. With a focus on refined detailing and high-quality finishes, these pieces are created to complement both modern and classic aesthetics. Whether worn as a subtle statement or a standout accessory, every design adds a touch of sophistication to your look." },
      { tag: "p", text: "Perfect for a variety of occasions, our jewellery is ideal for:<br/>• Special occasions and celebrations<br/>• Elegant evening styling<br/>• Meaningful and memorable gifting<br/>• Building a long-term jewellery collection" },
      { tag: "p", text: "Every piece is developed with attention to durability and design longevity, ensuring it remains stylish across seasons and trends. With our curated selection of fine jewellery online, you can invest in pieces that offer both beauty and lasting value." },

      { tag: "h2", text: "Shop Rings, Pendants, Earrings & Bracelets" },
      { tag: "p", text: "At Barosche, we offer a complete jewellery collection designed to suit every preference, style, and occasion. Whether you're looking to buy jewellery online for everyday elegance or statement styling, our range of rings, pendants, earrings, and bracelets is crafted to deliver both beauty and versatility." },
      { tag: "p", text: "<a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Rings </a>– <strong>Timeless Symbols of Style:</strong> Our rings are designed to reflect elegance, individuality, and modern sophistication. From sleek <strong>minimalist jewellery</strong> bands to bold statement pieces, each ring is crafted with precision, comfort, and long-lasting quality—making it perfect for both daily wear and special moments." },
      { tag: "p", text: "<a href='/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Pendants</a> – <strong>Subtle Yet Striking:</strong> Our pendants are created to add a refined focal point to your look. With clean designs and premium finishes, they offer effortless styling whether worn alone or layered. These pieces are ideal for those who appreciate understated elegance with a contemporary touch." },
      { tag: "p", text: "<a href='/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Earrings </a>– <strong>Everyday Elegance:</strong> Our earrings combine comfort with modern aesthetics, making them suitable for all-day wear. Designed to complement both casual and formal outfits, they are an essential part of any <strong>fine jewellery </strong>collection, offering versatility and timeless appeal." },
      { tag: "p", text: "<a href='/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Bracelets </a>– <strong>Effortless Luxury:</strong> Our bracelets are crafted to add a polished and sophisticated finish to your overall style. Designed with flexibility and elegance in mind, they seamlessly transition from everyday wear to occasion styling, making them a key part of your <strong> luxury accessories</strong> collection." },
      { tag: "p", text: "Together, these carefully curated collections allow you to build a complete and refined jewellery wardrobe, combining<strong> minimalist luxury jewellery</strong> with timeless design and modern functionality." },

      { tag: "h2", text: "Minimalist Jewellery for Everyday Wear" },
      { tag: "p", text: "Our <strong>minimalist jewellery</strong> collection is thoughtfully designed around simplicity, elegance, and everyday functionality. Created for modern individuals who value refined style, these pieces focus on clean aesthetics while maintaining comfort and versatility." },
      { tag: "p", text: "Key features of our minimalist designs include:<br/>• Clean lines and refined shapes<br/>• Lightweight and comfortable wear for all-day use<br/>• Subtle yet impactful styling<br/>• Versatile designs that pair effortlessly with multiple outfits" },
      { tag: "p", text: "Whether you're dressing for work, casual outings, or special occasions, minimalist jewellery offers a timeless appeal that seamlessly adapts to your lifestyle. Its understated beauty enhances your overall look without overpowering it, making it an essential part of a modern jewellery collection." },

      { tag: "h2", text: "Minimalist Luxury Jewellery for a Refined Look" },
      { tag: "p", text: "For those who appreciate understated sophistication, our <strong>minimalist luxury jewellery</strong> collection offers the perfect balance between simplicity and premium craftsmanship. Each piece is carefully crafted using high-quality materials and subtle detailing to create jewellery that feels elegant, modern, and effortlessly luxurious." },
      { tag: "p", text: "Ideal for:<br/>• Professional and office environments<br/>• Everyday styling with a polished touch<br/>• Elegant layering for a contemporary look<br/>• Modern fashion aesthetics with a luxury finish" },
      { tag: "p", text: "Designed to elevate your personal style, these pieces reflect the idea that true luxury lies in simplicity. With a focus on durability, comfort, and timeless design, our minimalist luxury jewellery allows you to express elegance in the most effortless way." },

      { tag: "h2", text: "Luxury Accessories to Elevate Your Style" },
      { tag: "p", text: "Our premium <strong>luxury accessories</strong> are thoughtfully designed to complement your jewellery and enhance your overall appearance. Created with a focus on quality, durability, and modern aesthetics, these pieces help you achieve a cohesive and sophisticated look with minimal effort." },
      { tag: "p", text: "Whether you prefer subtle elegance or bold accents, our collection is curated to suit a variety of personal styles. Each accessory is crafted to seamlessly integrate into your wardrobe, allowing you to transition effortlessly from everyday wear to special occasions." },
      { tag: "p", text: "Our collection offers:<br/>• Versatile styling options for multiple outfits<br/>• Long-lasting quality with premium finishes<br/>• Contemporary designs that reflect modern trends<br/>• Effortless integration into both casual and formal looks" },
      { tag: "p", text: "Designed to elevate your style, these luxury accessories add a refined touch to your overall presence while maintaining comfort and practicality." },

      { tag: "h2", text: "Semi-Handmade Jewellery with Unique Craftsmanship" },
      { tag: "p", text: "What truly sets Barosche apart is our focus on <strong>semi-handmade jewellery</strong>, where traditional craftsmanship meets modern innovation. Each piece is carefully developed with precision and attention to detail, ensuring a unique finish that reflects individuality and character." },
      { tag: "p", text: "By combining artisan techniques with contemporary design principles, we create jewellery that feels authentic, stylish, and timeless. Slight variations in each piece highlight the handcrafted aspect, making every item distinctive and special." },
      { tag: "p", text: "Key highlights of our craftsmanship include:<br/>• Intricate detailing that enhances visual appeal<br/>• A blend of traditional artistry and modern design<br/>• Unique variations that add individuality to each piece<br/>• Durable construction for long-lasting wear" },
      { tag: "p", text: "This thoughtful approach allows us to deliver <strong>semi-handmade jewellery </strong>that not only looks premium but also offers lasting comfort and quality—making it a valuable addition to any jewellery collection." },

      { tag: "h2", text: "Jewellery for Every Occasion" },
      { tag: "p", text: "Our collections are thoughtfully designed to seamlessly fit into every moment of your life. Whether you're dressing for daily routines or special celebrations, our jewellery offers the perfect balance of elegance, comfort, and versatility." },
      { tag: "p", text: "<strong>Daily Wear Jewellery:</strong> <br> Our <strong>minimalist jewellery</strong> pieces are lightweight, comfortable, and ideal for everyday use. Designed with clean lines and subtle detailing, they enhance your look while maintaining effortless simplicity." },
      { tag: "p", text: "<strong>Occasion Jewellery:</strong> <br> Make every celebration memorable with elegant <strong>fine jewellery</strong> and <strong> diamond jewellery </strong>that elevate your presence. These refined designs are perfect for events, parties, and special moments where style matters most." },
      { tag: "p", text: "<strong>Gifting Jewellery:</strong> <br>Timeless and meaningful, our jewellery makes the perfect gift for any occasion. Whether it’s a celebration or a personal milestone, these pieces are designed to create lasting impressions." },
      { tag: "p", text: "<strong>Fashion Jewellery Styling:</strong><br> Explore versatile designs that allow you to experiment with layering and modern trends. From subtle combinations to statement looks, our collection adapts to your unique style." },
      { tag: "p", text: "From <strong> earrings and rings to bracelets and pendants, </strong>every piece is carefully crafted to match your lifestyle while offering both functionality and elegance." },

      { tag: "h2", text: "Buy Jewellery Online with Confidence" },
      { tag: "p", text: "When you choose to <strong> buy jewellery online </strong>from Barosche, you experience a platform built on convenience, trust, and quality. We are committed to delivering a seamless shopping journey from start to finish." },
      { tag: "p", text: "With our curated selection of <strong>  fine jewellery online, </strong>  you benefit from:<br/>• Secure and safe transactions<br/>• Detailed product descriptions with high-quality images<br/>• Premium materials and refined finishes<br/>• Smooth and user-friendly browsing experience<br/>• Reliable and timely delivery services" },
      { tag: "p", text: "Our goal is to make  <strong> buying jewellery online </strong>  simple, enjoyable, and completely trustworthy. With a strong focus on customer satisfaction and product quality, Barosche ensures that every purchase reflects elegance, value, and confidence." },

      { tag: "h2", text: "Why Barosche is Your Trusted Jewellery Destination" },
      { tag: "p", text: "• Premium <strong>  fine jewellery  </strong> crafted with precision<br/>• Elegant and timeless <strong>  diamond jewellery </strong> <br/>• Unique  <strong> semi-handmade jewellery designs </strong> <br/>• Modern  <strong> minimalist jewellery </strong>  collections<br/>• Exclusive  <strong> minimalist luxury jewellery </strong>  range<br/>• High-quality <strong>  luxury accessories </strong> <br/>• Complete collection of <strong>  rings, pendants, earrings, and bracelets </strong> <br/>• Safe and convenient way to  <strong> buy jewellery online </strong> " },
      { tag: "p", text: "Barosche is more than just a jewellery brand—it’s a reflection of modern elegance and thoughtful craftsmanship. With a focus on  <strong>  fine jewellery, diamond jewellery  <strong> , and premium  <strong>  luxury accessories,  </strong> we offer designs that are timeless, versatile, and unique." },
      { tag: "p", text: "If you're looking to <strog> buy jewellery online </strog>, explore our exclusive collection ofsemi-handmade jewellery,   including beautifully crafted rings, pendants, earrings, and bracelets, and redefine your style with confidence." }
    ]
  },
  {
    id: 2,
    title: "Frequently Asked Questions",
    faqs: [
      { q: "1. What type of jewellery does Barosche offer?", a: "Barosche offers a wide range of jewellery including rings, pendants, earrings, and bracelets designed with a focus on elegance and modern style." },
      { q: "2. What is semi-handmade jewellery?", a: "Semi-handmade jewellery combines traditional craftsmanship with modern techniques, ensuring each piece has unique detailing and high-quality finishing." },
      { q: "3. Do you sell fine jewellery online?", a: "Yes, Barosche specializes in offering premium  <strong>  fine jewellery online  </strong> with a seamless and secure shopping experience." },
      { q: "4. Is your diamond jewellery suitable for everyday wear?", a: "Our <strong>  diamond jewellery </strong>  is designed for both everyday elegance and special occasions, offering durability along with timeless beauty." },
      { q: "5. Can I buy jewellery online safely from Barosche?", a: "Yes, you can safely <strong>  buy jewellery online  </strong> from Barosche with secure payment options and a trusted shopping platform." },
      { q: "6. What makes your minimalist jewellery unique?", a: "Our  <strong> minimalist jewellery  </strong> focuses on clean designs, subtle elegance, and versatility, making it ideal for modern lifestyles." },
      { q: "7. Do you offer minimalist luxury jewellery?", a: "Yes, we offer <strong>  minimalist luxury jewellery  </strong> that combines premium materials with understated, sophisticated design." },
      { q: "8. Are your jewellery pieces suitable for gifting?", a: "Absolutely, our jewellery is perfect for gifting on birthdays, anniversaries, and special occasions." },
      { q: "9. What materials are used in your jewellery?", a: "We use high-quality materials to ensure durability, shine, and long-lasting wear across all our collections." },
      { q: "10. Do you offer jewellery for daily wear?", a: "Yes, our minimalist designs are lightweight and comfortable, making them perfect for everyday use." },
      { q: "11. How do I choose the right jewellery online?", a: "You can explore detailed product descriptions, images, and styling suggestions to choose the right piece when you <strong>  buy jewellery online. </strong> " },
      { q: "12. Are your rings available in different styles?", a: "Yes, our rings include minimalist designs, statement pieces, and elegant styles for various occasions." },
      { q: "13. Can I wear your jewellery for special occasions?", a: "Yes, our  <strong> fine jewellery  </strong> and  <strong> diamond jewellery  </strong> collections are perfect for weddings, parties, and formal events." },
      { q: "14. What are luxury accessories in your collection?", a: "Our  <strong> luxury accessories  </strong>  include premium jewellery pieces designed to enhance your overall style with elegance and sophistication." },
      { q: "15. Is your jewellery durable for long-term use?", a: "Yes, our jewellery is crafted with precision and high-quality materials to ensure long-lasting durability." },
      { q: "16. Do you offer versatile jewellery designs?", a: "Yes, our designs are created to be versatile, allowing you to style them for both casual and formal occasions." },
      { q: "17. Can I layer your jewellery pieces?", a: "Absolutely, our minimalist designs are perfect for layering to create a modern and stylish look." },
      { q: "18. What makes Barosche different from other jewellery brands?", a: "Barosche stands out for its  <strong> semi-handmade jewellery </strong> , premium craftsmanship, and focus on minimalist luxury design." },
      { q: "19. Do you provide a smooth online shopping experience?", a: "Yes, we ensure a user-friendly platform, secure checkout, and reliable delivery for a seamless experience." },
      { q: "20. Why should I choose Barosche for buying jewellery online?", a: "Barosche offers a combination of  <strong> fine jewellery, diamond jewellery, and luxury accessories, </strong>  making it a trusted choice to <strong>  buy jewellery  </strong> online with confidence." }
    ]
  }
];

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="accordion-icon">{isOpen ? "▼" : "▶"}</span>
        {title}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const Reviews = () => {
  const [accordionData, setAccordionData] = useState(INITIAL_ACCORDION_DATA);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        // 1. Gather all strings to translate sequentially
        const textsToTranslate = [];
        INITIAL_ACCORDION_DATA.forEach((item) => {
          textsToTranslate.push(item.title);
          if (item.blocks) {
            item.blocks.forEach((b) => textsToTranslate.push(b.text));
          }
          if (item.faqs) {
            item.faqs.forEach((f) => {
              textsToTranslate.push(f.q);
              textsToTranslate.push(f.a);
            });
          }
        });

        // 2. Single API post call
        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: textsToTranslate,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });

        const translateData = await translateRes.json();
        if (!translateData.success) return;

        const translations = translateData.translations;
        let pointer = 0;

        // 3. Reconstruct the object from sequential translation response
        const translatedData = INITIAL_ACCORDION_DATA.map((item) => {
          const newTitle = translations[pointer++] || item.title;

          let newBlocks = undefined;
          if (item.blocks) {
            newBlocks = item.blocks.map((b) => ({
              ...b,
              text: translations[pointer++] || b.text,
            }));
          }

          let newFaqs = undefined;
          if (item.faqs) {
            newFaqs = item.faqs.map((f) => ({
              q: translations[pointer++] || f.q,
              a: translations[pointer++] || f.a,
            }));
          }

          return {
            ...item,
            title: newTitle,
            blocks: newBlocks,
            faqs: newFaqs,
          };
        });

        setAccordionData(translatedData);
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  return (
    <section className="reviews-section">
      <div className="accordion-container">
        {accordionData.map((item) => (
          <AccordionItem key={item.id} title={item.title}>
            {/* Render Tab 1 blocks with dangerouslySetInnerHTML to support bold and links */}
            {item.blocks &&
              item.blocks.map((block, idx) => {
                if (block.tag === "h2") return <h2 key={idx} className="accordion-content-title" dangerouslySetInnerHTML={{ __html: block.text }}></h2>;
                if (block.tag === "p") return <p key={idx} className="accordion-content-text" dangerouslySetInnerHTML={{ __html: block.text }}></p>;
                return null;
              })}

            {/* Render Tab 2 FAQ content */}
            {item.faqs && (
              <div className="faq-wrapper">
                {item.faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <h4 className="faq-question">{faq.q}</h4>
                    <p className="faq-answer">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </AccordionItem>
        ))}
      </div>
    </section>
  );
};

export default Reviews;