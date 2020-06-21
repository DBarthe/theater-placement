

export function removeTrailingSlash(path : string) : string {
    if (path.endsWith('/')) {
        path = path.slice(0, path.length - 1)
    }
    return path
}