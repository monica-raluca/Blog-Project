// Utility functions for content processing

// Function to extract a smart formatted summary from article content
export const extractSmartSummary = (content: string): string => {
    if (!content) return '';

    try {
        // Check if content is JSON (Lexical editor state)
        const isJsonContent = content.trim().startsWith('{') && content.trim().endsWith('}');
        
        if (isJsonContent) {
            const parsed = JSON.parse(content);
            
            if (parsed.root && parsed.root.children) {
                const firstNode = parsed.root.children[0];
                
                // If the first node is a quote, return just the quote with formatting
                if (firstNode && firstNode.type === 'quote') {
                    const summaryState = {
                        root: {
                            children: [firstNode],
                            direction: parsed.root.direction || 'ltr',
                            format: parsed.root.format || '',
                            indent: parsed.root.indent || 0,
                            type: 'root',
                            version: 1
                        }
                    };
                    return JSON.stringify(summaryState);
                }
                
                // Otherwise, get content up to a reasonable limit while preserving formatting
                let totalTextLength = 0;
                const summaryNodes: any[] = [];
                let shouldStop = false;

                const getTextLength = (nodes: any[]): number => {
                    if (!Array.isArray(nodes)) return 0;
                    return nodes.reduce((total, node) => {
                        if (node.text) return total + node.text.length;
                        if (node.children) return total + getTextLength(node.children);
                        return total;
                    }, 0);
                };

                for (const node of parsed.root.children) {
                    if (shouldStop) break;
                    
                    // Stop if we encounter a quote (unless it's the first node)
                    if (node.type === 'quote' && summaryNodes.length > 0) {
                        break;
                    }
                    
                    const nodeTextLength = getTextLength([node]);
                    
                    // If adding this node would exceed our limit, try to truncate it
                    if (totalTextLength + nodeTextLength > 120 && summaryNodes.length > 0) {
                        break;
                    }
                    
                    // Add the node and update total length
                    summaryNodes.push(node);
                    totalTextLength += nodeTextLength;
                    
                    // If we've reached a good stopping point, break
                    if (totalTextLength >= 100) {
                        shouldStop = true;
                    }
                }

                // Create the summary state with selected nodes
                const summaryState = {
                    root: {
                        children: summaryNodes,
                        direction: parsed.root.direction || 'ltr',
                        format: parsed.root.format || '',
                        indent: parsed.root.indent || 0,
                        type: 'root',
                        version: 1
                    }
                };
                
                return JSON.stringify(summaryState);
            }
            
            // Fallback for malformed JSON
            return content;
        } else {
            // Handle HTML content - return as is for now, LexicalContentRenderer will handle it
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            // Check if first element is a blockquote and handle accordingly
            const firstElement = tempDiv.firstElementChild;
            if (firstElement && firstElement.tagName.toLowerCase() === 'blockquote') {
                return firstElement.outerHTML;
            }
            
            // For HTML, try to limit content while preserving structure
            const textContent = tempDiv.textContent || '';
            if (textContent.length <= 120) {
                return content;
            }
            
            // Truncate HTML while trying to preserve structure
            let currentLength = 0;
            const walker = document.createTreeWalker(
                tempDiv,
                NodeFilter.SHOW_TEXT
            );
            
            let node;
            while (node = walker.nextNode()) {
                const textNode = node as Text;
                const remainingSpace = 120 - currentLength;
                
                if (textNode.textContent && textNode.textContent.length <= remainingSpace) {
                    currentLength += textNode.textContent.length;
                } else {
                    // Truncate this text node
                    if (textNode.textContent) {
                        textNode.textContent = textNode.textContent.substring(0, remainingSpace) + '...';
                    }
                    break;
                }
            }
            
            return tempDiv.innerHTML;
        }
    } catch (error) {
        // Fallback: return original content
        return content;
    }
};