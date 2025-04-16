export function buildHeaders(authToken, queryParams = {}, tagName = '') {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`,
        },
        params: queryParams,
        tags: {
            name: tagName
        },
    };
}