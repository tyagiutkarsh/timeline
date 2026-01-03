export function parseTimelineMd(markdown) {
  const lines = markdown.split('\n');
  let currentCategory = '';
  const entries = [];
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      currentCategory = line.slice(2).trim();
    } else if (line.match(/^[A-Z][a-z]{2}, \d{4}:/)) {
      const match = line.match(/^([A-Z][a-z]{2}), (\d{4}): ([^\[]+)(?:\[([^\]]+)\])?/);
      if (match) {
        entries.push({
          month: match[1],
          year: parseInt(match[2]),
          title: match[3].trim(),
          link: match[4]?.trim(),
          category: currentCategory
        });
      }
    }
  }
  
  return entries;
}

export function getDate(entry) {
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return new Date(entry.year, monthMap[entry.month]);
}
