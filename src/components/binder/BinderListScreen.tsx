"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { PageHeader } from "@/components/layout/PageHeader";
import { BinderPage } from "@/components/binder/BinderPage";
import { BinderGrid } from "@/components/binder/BinderGrid";
import { CameraFlow } from "@/components/binder/CameraFlow";
import { CardSearchSheet } from "@/components/binder/CardSearchSheet";
import { CardViewerModal } from "@/components/binder/CardViewerModal";
import { EditCardSheet } from "@/components/binder/EditCardSheet";
import { useApp } from "@/providers/AppProvider";
import { getCardDetail } from "@/lib/pokemonTcg";
import type { CardListType, PokemonCard } from "@/types";

interface BinderListScreenProps {
  listType: CardListType;
}

export function BinderListScreen({ listType }: BinderListScreenProps) {
  const {
    wishlist,
    tradeBinder,
    removeFromWishlist,
    removeFromBinder,
    addCardFromCamera,
    addIdentifiedCard,
    updateCard,
  } = useApp();

  const [cameraOpen, setCameraOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewingCard, setViewingCard] = useState<PokemonCard | null>(null);
  const [editingCard, setEditingCard] = useState<PokemonCard | null>(null);

  const cards = listType === "wishlist" ? wishlist : tradeBinder;
  const title = listType === "wishlist" ? "Wishlist" : "Trade Binder";
  const onDelete = listType === "wishlist" ? removeFromWishlist : removeFromBinder;

  return (
    <PageTransition>
      <PageHeader title={title} showBack backHref="/" />
      <div className="px-3 pb-4">
        <BinderPage>
          <BinderGrid
            cards={cards}
            onSearch={() => setSearchOpen(true)}
            onScan={() => setCameraOpen(true)}
            onEdit={setEditingCard}
            onDelete={onDelete}
            onView={setViewingCard}
          />
        </BinderPage>
      </div>

      {searchOpen && (
        <CardSearchSheet
          title={listType === "wishlist" ? "Add Wishlist Card" : "Add Trade Card"}
          onSelect={async (apiCard) => {
            setSearchOpen(false);
            const detail = await getCardDetail(apiCard.id);
            addIdentifiedCard({ ...apiCard, ...(detail ?? {}) }, listType);
          }}
          onAddManual={(name) => {
            if (name) addCardFromCamera(name, "", listType);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {cameraOpen && (
        <CameraFlow
          listType={listType}
          onIdentified={(apiCard, photoUrl) => {
            addIdentifiedCard(apiCard, listType, photoUrl);
            setCameraOpen(false);
          }}
          onManual={(name, photoUrl) => {
            addCardFromCamera(name, photoUrl, listType);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {viewingCard && (
        <CardViewerModal card={viewingCard} onClose={() => setViewingCard(null)} />
      )}

      {editingCard && (
        <EditCardSheet
          card={editingCard}
          onSave={(patch) => {
            updateCard(editingCard.id, patch, listType);
            setEditingCard(null);
          }}
          onClose={() => setEditingCard(null)}
        />
      )}
    </PageTransition>
  );
}
