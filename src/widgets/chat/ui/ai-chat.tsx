import { ChatInput } from "../../../shared/input"
import { ChatOutput } from "../../../shared/output"

export default function Chat() {
    return (
        <div>
            <ChatInput/>
            {ChatOutput('hi')}
        </div>
    )
}