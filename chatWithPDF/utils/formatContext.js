function formatContextArray(contextArray) {
    return contextArray.map((doc, index) => {
      const title = doc.metadata?.pdf?.info?.Title || 'Untitled';
      const page = doc.metadata?.loc?.pageNumber || 'N/A';
      const content = doc.pageContent || '';
  
      return `--- [Document ${index + 1}] ---
                Title: ${title}
                Page: ${page}
                
                ${content}`;
    }).join('\n');
}

export { formatContextArray };