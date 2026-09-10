"use client";
import { useState, useEffect } from "react";
import { $getSelection, $isRangeSelection, $createParagraphNode } from "lexical";
import { $createQuoteNode } from "@lexical/rich-text";
import { 
  MDXEditor,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  frontmatterPlugin,
  diffSourcePlugin,
  quotePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  StrikeThroughSupSubToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertAdmonition,
  InsertFrontmatter,
  Separator,
  DiffSourceToggleWrapper,
  useCellValues,
  activeEditor$
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

function getTopLevelElement(selection) {
  const anchorNode = selection.anchor.getNode();
  return anchorNode.getKey() === "root"
    ? anchorNode
    : anchorNode.getTopLevelElementOrThrow();
}

// Quote Toggle — selected text/paragraph ko blockquote (italic quote style) bana deta hai
function QuoteToggle() {
  const [activeEditor] = useCellValues(activeEditor$);
  const [isQuote, setIsQuote] = useState(false);

  // Sirf button ka "active" look dikhane ke liye
  useEffect(() => {
    if (!activeEditor) return;
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        try {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setIsQuote(getTopLevelElement(selection).getType() === "quote");
          }
        } catch (err) {
          // fail silently, never break the rest of the toolbar
        }
      });
    });
  }, [activeEditor]);

  const toggleQuote = () => {
    if (!activeEditor) return;
    activeEditor.update(() => {
      try {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const topNode = getTopLevelElement(selection);
        const currentlyQuote = topNode.getType() === "quote";

        // Manual low-level replace — $setBlocksType use nahi kiya, isse version
        // mismatch/edge-case wali dikkat avoid hoti hai jo blockquote ko wapas
        // paragraph banane mein aa rahi thi.
        const newNode = currentlyQuote ? $createParagraphNode() : $createQuoteNode();
        const children = topNode.getChildren();
        children.forEach((child) => newNode.append(child));
        topNode.replace(newNode);
        newNode.selectEnd();
      } catch (err) {
        console.error("Quote toggle failed:", err);
      }
    });
  };

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={toggleQuote}
      title="Quote"
      className={isQuote ? "mdx-quote-btn active" : "mdx-quote-btn"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        border: "none",
        borderRadius: "4px",
        background: isQuote ? "#f0e4cc" : "transparent",
        cursor: "pointer",
        fontFamily: "Georgia, serif",
        fontWeight: "bold",
        fontSize: "30px",
        color: isQuote ? "#c9a96e" : "#555",
        lineHeight: 1,
      }}
    >
      ❝
    </button>
  );
}

export default function MDXEditorComponent({ 
  onChange, 
  initialContent = "" 
}) {
  
  async function imageUploadHandler(file) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zinniezeera.com";
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_URL}/api/blogs/upload-image`, {
    method: 'POST',
    body: formData
  });
  const json = await response.json();
  return json.url;
}

  return (
    <MDXEditor
      markdown={initialContent || ""}
      onChange={onChange}
      className="mdxeditor-root" 
      plugins={[
        headingsPlugin(), 
        listsPlugin(), 
        linkPlugin(), 
        linkDialogPlugin(),
        imagePlugin({ imageUploadHandler }), 
        tablePlugin(), 
        thematicBreakPlugin(), 
        markdownShortcutPlugin(),
        quotePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', html: 'HTML' } }),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        frontmatterPlugin(),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <StrikeThroughSupSubToggles /> 
              <Separator />
              <QuoteToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <InsertCodeBlock />
              <InsertAdmonition />
              <Separator />
              <InsertFrontmatter />
            </DiffSourceToggleWrapper>
          )
        })
      ]}
    />
  );
}