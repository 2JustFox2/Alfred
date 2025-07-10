export default function ChatInput(inputValue: string, handleChange: (event: any) => void, handleKeyDown: (event: any) => void) {
    return (
        <>
            <input type="text" value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown}/>
        </>
    )
}