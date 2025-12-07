import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types';

export interface ChatHistory {
  id: string;
  user_id: string;
  session_id: string;
  product_name: string | null;
  ocr_text: string | null;
  analysis_data: any | null;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  health_conditions?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Chat History Functions
export const createChatSession = async (
  productName: string | null,
  ocrText: string | null,
  analysisData: any | null
): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      product_name: productName,
      ocr_text: ocrText,
      analysis_data: analysisData,
      messages: [],
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }

  return data.id;
};

export const saveChatMessage = async (
  sessionId: string,
  message: ChatMessage
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get current messages
  const { data: session, error: fetchError } = await supabase
    .from('chat_sessions')
    .select('messages')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !session) {
    console.error('Error fetching session:', fetchError);
    return false;
  }

  // Append new message
  const updatedMessages = [...(session.messages || []), message];

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      messages: updatedMessages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error saving message:', error);
    return false;
  }

  return true;
};

export const getChatSessions = async (): Promise<ChatHistory[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }

  return data || [];
};

export const getChatSession = async (sessionId: string): Promise<ChatHistory | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching chat session:', error);
    return null;
  }

  return data;
};

export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }

  return true;
};

// User Profile Functions
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const createOrUpdateUserProfile = async (
  name: string | null,
  age: number | null,
  gender: string | null
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // We are no longer saving health_conditions, but keeping the column in DB for now
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      name,
      age,
      gender,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error saving user profile:', error);
    return false;
  }

  return true;
};

