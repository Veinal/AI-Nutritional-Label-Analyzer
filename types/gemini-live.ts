export interface LiveConfig {
    model: string;
    system_instruction?: {
        parts: { text: string }[];
    };
    generation_config?: {
        response_modalities?: ("TEXT" | "AUDIO" | "IMAGE")[];
        speech_config?: {
            voice_config?: {
                prebuilt_voice_config?: {
                    voice_name: string;
                };
            };
        };
    };
}

export interface LiveSetupMessage {
    setup: LiveConfig;
}

export interface RealtimeInputMessage {
    realtime_input: {
        media_chunks: {
            mime_type: string;
            data: string;
        }[];
    };
}

export interface ClientContentMessage {
    client_content: {
        turns: {
            role: string;
            parts: { text: string }[];
        }[];
        turn_complete: boolean;
    };
}

export interface ServerContentMessage {
    server_content: {
        model_turn: {
            parts: {
                text?: string;
                inline_data?: {
                    mime_type: string;
                    data: string;
                };
            }[];
        };
        turn_complete: boolean;
    };
}

export interface ToolCallMessage {
    tool_call: {
        function_calls: {
            name: string;
            args: any;
            id: string;
        }[];
    };
}

export interface ToolResponseMessage {
    tool_response: {
        function_responses: {
            name: string;
            response: any;
            id: string;
        }[];
    };
}

export type LiveClientMessage = LiveSetupMessage | RealtimeInputMessage | ClientContentMessage | ToolResponseMessage;
export type LiveServerMessage = ServerContentMessage | ToolCallMessage;
