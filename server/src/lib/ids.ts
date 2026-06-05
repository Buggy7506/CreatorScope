import crypto from "crypto";

export const createId = () => crypto.randomUUID();
