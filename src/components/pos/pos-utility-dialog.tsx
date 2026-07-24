"use client";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DashboardDialogContent,
  DashboardDialogHeader,
  DashboardDialogTitle,
  DashboardDialogDescription,
  DashboardDialogBody,
  DashboardDialogActions,
} from "@/components/dashboard";
import type { useMutation } from "@tanstack/react-query";

type UtilityDialogType = "customer-lookup" | "price-check" | "void-sale" | "returns" | null;

interface PosUtilityDialogProps {
  dialog: UtilityDialogType;
  input: string;
  onInputChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirmLoading: boolean;
  confirmDisabled: boolean;
}

export function PosUtilityDialog({
  dialog,
  input,
  onInputChange,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  confirmLoading,
  confirmDisabled,
}: PosUtilityDialogProps) {
  return (
    <Dialog open={dialog !== null} onOpenChange={(open) => !open && onClose()}>
      <DashboardDialogContent className="sm:max-w-md">
        <DashboardDialogHeader>
          <DashboardDialogTitle>
            {dialog === "customer-lookup" && "Lookup customer"}
            {dialog === "price-check" && "Check product price"}
            {dialog === "void-sale" && "Void sale"}
          </DashboardDialogTitle>
          <DashboardDialogDescription>
            {dialog === "customer-lookup" &&
              "Search by customer phone and apply the first match to the sale."}
            {dialog === "price-check" &&
              "Search by product name or barcode before adding it to the cart."}
            {dialog === "void-sale" &&
              "Enter the sale ID and reason before voiding a completed sale."}
          </DashboardDialogDescription>
        </DashboardDialogHeader>
        <DashboardDialogBody className="space-y-3">
          <Input
            autoFocus
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onConfirm();
              }
            }}
            placeholder={
              dialog === "customer-lookup"
                ? "Customer phone"
                : dialog === "price-check"
                  ? "Product name or barcode"
                  : "Sale ID"
            }
          />
          {/* returns dialog uses simple confirm - handled inline in parent */}
            {dialog === "void-sale" && (
            <Input
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onConfirm();
                }
              }}
              placeholder="Void reason"
            />
          )}
        </DashboardDialogBody>
        <DashboardDialogActions
          confirmLabel={
            dialog === "customer-lookup"
              ? "Lookup"
              : dialog === "price-check"
                ? "Check price"
                : "Void sale"
          }
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
          confirmLoading={confirmLoading}
          onCancel={onClose}
        />
      </DashboardDialogContent>
    </Dialog>
  );
}