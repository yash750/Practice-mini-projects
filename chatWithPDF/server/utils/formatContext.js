function formatContextArray(contextArray) {
    return contextArray.map((doc, index) => {
      const title = doc.metadata?.pdf?.info?.Title || 'Untitled';
      const page = doc.metadata?.loc?.pageNumber || 'N/A';
      const content = doc.pageContent || '';
  
      return `📄 Source ${index + 1}:
              📖 Document: ${title}
              📃 Page: ${page}

              ${content}`;
    });
  }

function formatContextForUI(contextArray) {
    return contextArray.map((doc, index) => ({
      id: index + 1,
      title: doc.metadata?.pdf?.info?.Title || 'Untitled',
      page: doc.metadata?.loc?.pageNumber || 'N/A',
      content: doc.pageContent || '',
      preview: (doc.pageContent || '').substring(0, 200) + (doc.pageContent?.length > 200 ? '...' : '')
    }));
}

export { formatContextArray, formatContextForUI };