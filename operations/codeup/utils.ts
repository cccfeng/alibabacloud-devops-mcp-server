/**
 * Common utility functions for Codeup operations
 */

import { z } from "zod";

/**
 * Handle repository ID encoding
 * @param repositoryId Repository ID which may contain unencoded slash
 * @returns Properly encoded repository ID
 */
export function handleRepositoryIdEncoding(repositoryId: string): string {
  let encodedRepoId = repositoryId;
  
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  return encodedRepoId;
}

/**
 * Converts a floating point number to an integer string (removes decimal point and decimal part)
 * Used primarily for handling numeric IDs that might come as floats from JSON parsing
 * @param value Value to convert
 * @returns Integer string representation
 */
export function floatToIntString(value: any): string {
  // 如果传入的是字符串，先尝试转为浮点数
  if (typeof value === 'string') {
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      value = floatValue;
    } else {
      return value; // 如果转换失败，返回原字符串
    }
  }

  // 处理浮点数
  if (typeof value === 'number') {
    const intValue = Math.floor(value + 0.5); // 四舍五入转整数
    return intValue.toString();
  }

  // 处理其他情况，直接转字符串
  return String(value);
}

export function safeParseNumber(input: string | number | undefined): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  
  // If the input is a string, try to convert it to a float first
  let numValue: number;
  if (typeof input === 'string') {
    numValue = parseFloat(input);
    if (isNaN(numValue)) {
      return undefined;
    }
  } else {
    numValue = input;
  }
  
  return numValue;
} 