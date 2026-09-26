import { create } from "zustand";
import toast from "react-hot-toast";

type ToggleResult = "added" | "removed" | "auth" | "error";

interface WishlistStore {
  ids: string[];
  loaded: boolean;
  loading: boolean;
  signedIn: boolean;
  load: (force?: boolean) => Promise<void>;
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<ToggleResult>;
  remove: (id: string) => void;
}

// One fetch per page load: every heart button calls load(), the store dedupes.
const useWishlist = create<WishlistStore>((set, get) => ({
  ids: [],
  loaded: false,
  loading: false,
  signedIn: false,

  load: async (force = false) => {
    const { loaded, loading } = get();
    if (loading || (loaded && !force)) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/wishlist", { cache: "no-store" });
      if (res.status === 401) {
        set({ ids: [], signedIn: false, loaded: true });
      } else if (res.ok) {
        const data = await res.json();
        set({ ids: data.ids || [], signedIn: true, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  has: (id) => get().ids.includes(id),

  remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),

  toggle: async (id) => {
    // The session may have changed since the first load (sign-in/out in-app).
    if (!get().signedIn) await get().load(true);
    if (!get().signedIn) return "auth";

    const wasIn = get().ids.includes(id);
    set({ ids: wasIn ? get().ids.filter((x) => x !== id) : [...get().ids, id] });

    try {
      const res = wasIn
        ? await fetch(`/api/wishlist?productId=${encodeURIComponent(id)}`, { method: "DELETE" })
        : await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
          });
      if (res.status === 401) {
        set({ ids: [], signedIn: false });
        return "auth";
      }
      if (!res.ok) throw new Error("request failed");
      toast.success(wasIn ? "Removed from wishlist." : "Added to wishlist.");
      return wasIn ? "removed" : "added";
    } catch {
      set({ ids: wasIn ? [...get().ids, id] : get().ids.filter((x) => x !== id) });
      toast.error("Could not update your wishlist. Please try again.");
      return "error";
    }
  },
}));

export default useWishlist;
