import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { serverError } from "@/lib/server-error";
import { Faq, FAQ_PAGE_TYPES, type FaqPageType } from "@/models/Faq";

function isPageType(value: unknown): value is FaqPageType {
  return FAQ_PAGE_TYPES.includes(value as FaqPageType);
}

export type AdminFaqFilters = { pageType?: string | undefined; status?: string | undefined; query?: string | undefined };

/** Admin list — every FAQ including drafts. */
export const getAdminFaqsFn = createServerFn({ method: "GET" })
  .validator((data: AdminFaqFilters) => data ?? {})
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const filter: Record<string, unknown> = {};
      if (isPageType(data?.pageType)) filter["pageType"] = data.pageType;
      if (data?.status === "published" || data?.status === "draft") filter["status"] = data.status;
      const query = String(data?.query || "").trim();
      if (query) {
        const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter["$or"] = [{ question: re }, { answer: re }, { pageSlug: re }];
      }

      const docs = await Faq.find(filter).sort({ pageType: 1, order: 1, createdAt: 1 }).limit(500).lean();
      const counts = await Faq.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

      return {
        success: true as const,
        faqs: docs.map((f) => ({
          id: String(f._id),
          question: f.question,
          answer: f.answer,
          pageType: f.pageType,
          pageSlug: f.pageSlug || "",
          order: f.order ?? 0,
          status: f.status,
          updatedAt: new Date(f.updatedAt).toISOString(),
        })),
        counts: {
          published: counts.find((c) => c._id === "published")?.count ?? 0,
          draft: counts.find((c) => c._id === "draft")?.count ?? 0,
        },
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getAdminFaqs", error) };
    }
  });

export type FaqInput = {
  id?: string;
  question: string;
  answer: string;
  pageType: string;
  pageSlug?: string;
  order?: number;
  status?: string;
};

/** Creates or updates one FAQ. */
export const saveFaqFn = createServerFn({ method: "POST" })
  .validator((data: FaqInput) => data)
  .handler(async ({ data }) => {
    try {
      const admin = await requireAdminUser();
      await connectToDatabase();

      const question = String(data?.question || "").trim();
      const answer = String(data?.answer || "").trim();
      if (question.length < 5) return { success: false as const, error: "Write the question out in full." };
      if (answer.length < 10) return { success: false as const, error: "The answer looks too short to help anyone." };
      if (!isPageType(data?.pageType)) return { success: false as const, error: "Choose where this FAQ appears." };

      const fields = {
        question: question.slice(0, 300),
        answer: answer.slice(0, 4000),
        pageType: data.pageType,
        pageSlug: String(data?.pageSlug || "").trim().toLowerCase().slice(0, 120),
        order: Number.isFinite(Number(data?.order)) ? Number(data.order) : 0,
        status: data?.status === "draft" ? ("draft" as const) : ("published" as const),
        updatedByAdminId: admin._id,
      };

      if (data?.id) {
        const updated = await Faq.findByIdAndUpdate(data.id, fields, { new: true });
        if (!updated) return { success: false as const, error: "That FAQ no longer exists." };
        return { success: true as const, id: String(updated._id) };
      }

      const created = await Faq.create({ ...fields, createdByAdminId: admin._id });
      return { success: true as const, id: String(created._id) };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("saveFaq", error) };
    }
  });

/**
 * Unpublishes or republishes an FAQ. Nothing is removed — an FAQ that turned out to be wrong is
 * moved to draft so the wording survives for whoever fixes it.
 */
export const setFaqStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: "published" | "draft" }) => data)
  .handler(async ({ data }) => {
    try {
      const admin = await requireAdminUser();
      await connectToDatabase();
      const status = data?.status === "draft" ? "draft" : "published";
      const updated = await Faq.findByIdAndUpdate(data?.id, { status, updatedByAdminId: admin._id }, { new: true });
      if (!updated) return { success: false as const, error: "That FAQ no longer exists." };
      return { success: true as const, status };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("setFaqStatus", error) };
    }
  });

/**
 * Published FAQs for one page, appended to the hand-written catalog FAQs already on it.
 * Entries with no `pageSlug` apply to every page of that type.
 */
export const getPageFaqsFn = createServerFn({ method: "GET" })
  .validator((data: { pageType: string; pageSlug?: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!isPageType(data?.pageType)) return { success: true as const, faqs: [] };
      await connectToDatabase();

      const slug = String(data?.pageSlug || "").trim().toLowerCase();
      const docs = await Faq.find({
        status: "published",
        pageType: data.pageType,
        ...(slug ? { $or: [{ pageSlug: slug }, { pageSlug: "" }, { pageSlug: null }] } : {}),
      })
        .sort({ order: 1, createdAt: 1 })
        .limit(50)
        .lean();

      return { success: true as const, faqs: docs.map((f) => ({ q: f.question, a: f.answer })) };
    } catch (error: unknown) {
      // A page must still render if its extra FAQs can't be loaded.
      console.error("getPageFaqs failed:", error instanceof Error ? error.message : String(error));
      return { success: true as const, faqs: [] };
    }
  });
