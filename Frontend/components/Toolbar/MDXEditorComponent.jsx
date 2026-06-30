"use client";
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
  DiffSourceToggleWrapper
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export default function MDXEditorComponent({ 
  onChange, 
  initialContent = "" 
}) {
  
  async function imageUploadHandler(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('http://localhost:5000/api/upload-image', {
      method: 'POST',
      body: formData
    });
    const json = await response.json();
    return json.url; 
  }

  return (
    <MDXEditor
      key={initialContent} 
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