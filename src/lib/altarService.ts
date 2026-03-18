import { supabase } from "./supabaseClient"

export async function checkNicknameExists(nickname: string) {
  const { data, error } = await supabase
    .from("holy_place_records")
    .select("nickname")
    .eq("nickname", nickname)
    .single()

  return data
}

export async function createAltarRecord(record: {
  nickname: string
  email?: string
  altar_image: string
  prayer: string
}) {

  const { data, error } = await supabase
    .from("holy_place_records")
    .insert([record])

  if (error) throw error

  return data
}

export async function getAltarRecord(nickname: string) {

  const { data, error } = await supabase
    .from("holy_place_records")
    .select("*")
    .eq("nickname", nickname)
    .single()

  if (error) throw error

  return data
}