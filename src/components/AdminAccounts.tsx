"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { removeAccountAction, saveAccountAction } from "@/app/actions/accounts";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";
import { localizeName } from "@/i18n/catalog-labels";
import { STUDY_LEVELS } from "@/lib/taxonomy";
import type { Dict } from "@/i18n/messages";

export interface AccountDepartment {
  id: string;
  name: string;
  programs: { id: string; name: string }[];
}

export interface AccountScopeInput {
  kind: "department" | "program";
  departmentId: string;
  programId: string;
  level: string;
}

export interface ManagedAccount {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "super_admin";
  programId: string | null;
  level: string | null;
  scopes: AccountScopeInput[];
}

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  if (code === "password") return errors.password;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

function blankScope(tree: AccountDepartment[]): AccountScopeInput {
  return {
    kind: "department",
    departmentId: tree[0]?.id ?? "",
    programId: tree[0]?.programs[0]?.id ?? "",
    level: "L1",
  };
}

export function AdminAccounts({
  tree,
  accounts,
}: {
  tree: AccountDepartment[];
  accounts: ManagedAccount[];
}) {
  const { dict } = useI18n();
  const t = dict.admin;

  return (
    <div className="space-y-8">
      <AccountForm tree={tree} />
      <ul className="space-y-4">
        {accounts.map((account) => (
          <li key={account.id}>
            <AccountForm tree={tree} account={account} />
          </li>
        ))}
      </ul>
      <p className="sr-only">{t.accountsTitle}</p>
    </div>
  );
}

function AccountForm({ tree, account }: { tree: AccountDepartment[]; account?: ManagedAccount }) {
  const { locale, dict } = useI18n();
  const t = dict.admin;
  const locked = account ? ["superadmin@univ-sujets.fr", "admin@univ-sujets.fr", "etudiant@univ-sujets.fr"].includes(account.email) : false;
  const [role, setRole] = useState<ManagedAccount["role"]>(account?.role ?? "student");
  const [scopes, setScopes] = useState<AccountScopeInput[]>(
    account?.scopes.length ? account.scopes : [blankScope(tree)]
  );
  const [state, formAction] = useFormState(saveAccountAction, undefined);
  const [removeState, removeAction] = useFormState(removeAccountAction, undefined);

  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-brand-900">
        {account ? account.name : t.createAccount}
      </h2>
      {account && <p className="mt-1 text-sm text-slate-500">{account.email}</p>}
      {locked ? (
        <p className="mt-4 text-sm text-slate-600">{t.demoLocked}</p>
      ) : (
        <>
          <form action={formAction} className="mt-4 space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-ai-50 px-3 py-2 text-sm text-ai-700">{errorText(state.error, dict.errors)}</div>
            )}
            {account && <input type="hidden" name="id" value={account.id} />}
            <input type="hidden" name="scopes" value={JSON.stringify(scopes)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{dict.auth.name}</label>
                <input name="name" required minLength={2} defaultValue={account?.name ?? ""} className="input" />
              </div>
              <div>
                <label className="label">{dict.auth.email}</label>
                <input name="email" type="email" required defaultValue={account?.email ?? ""} readOnly={Boolean(account)} className="input" />
              </div>
            </div>
            <div>
              <label className="label">{t.accountPassword}</label>
              <input name="password" type="password" minLength={account ? undefined : 8} autoComplete="new-password" className="input" required={!account} />
              {account && <p className="mt-1 text-xs text-slate-500">{t.accountPasswordKeep}</p>}
            </div>
            <fieldset>
              <legend className="label">{t.accountRole}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ["student", t.roleUser],
                  ["admin", t.roleAdmin],
                  ["super_admin", t.roleSuper],
                ] as const).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50">
                    <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {role === "student" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t.filiere}</label>
                  <select name="programId" required className="input" defaultValue={account?.programId ?? tree[0]?.programs[0]?.id}>
                    {tree.map((department) => (
                      <optgroup key={department.id} label={localizeName(department.name, locale)}>
                        {department.programs.map((program) => (
                          <option key={program.id} value={program.id}>{localizeName(program.name, locale)}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t.level}</label>
                  <select name="level" required className="input" defaultValue={account?.level ?? "L1"}>
                    {STUDY_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {role === "admin" && (
              <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50 p-4">
                <p className="text-sm font-semibold text-brand-800">{t.scopeKind}</p>
                {scopes.map((scope, index) => (
                  <div key={index} className="rounded-lg bg-white p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm has-[:checked]:text-brand-800">
                        <input
                          type="radio"
                          name={`kind-${index}`}
                          checked={scope.kind === "department"}
                          onChange={() => setScopes(scopes.map((item, i) => i === index ? { ...item, kind: "department" } : item))}
                        />
                        {t.scopeWhole}
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`kind-${index}`}
                          checked={scope.kind === "program"}
                          onChange={() => setScopes(scopes.map((item, i) => i === index ? { ...item, kind: "program" } : item))}
                        />
                        {t.scopeProgramLevel}
                      </label>
                    </div>
                    {scope.kind === "department" ? (
                      <select
                        className="input mt-3"
                        value={scope.departmentId}
                        onChange={(event) => setScopes(scopes.map((item, i) => i === index ? { ...item, departmentId: event.target.value } : item))}
                      >
                        {tree.map((department) => (
                          <option key={department.id} value={department.id}>{localizeName(department.name, locale)}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <select
                          className="input"
                          value={scope.programId}
                          onChange={(event) => setScopes(scopes.map((item, i) => i === index ? { ...item, programId: event.target.value } : item))}
                        >
                          {tree.map((department) => (
                            <optgroup key={department.id} label={localizeName(department.name, locale)}>
                              {department.programs.map((program) => (
                                <option key={program.id} value={program.id}>{localizeName(program.name, locale)}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <select
                          className="input"
                          value={scope.level}
                          onChange={(event) => setScopes(scopes.map((item, i) => i === index ? { ...item, level: event.target.value } : item))}
                        >
                          {STUDY_LEVELS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {scopes.length > 1 && (
                      <button
                        type="button"
                        className="mt-2 text-sm font-medium text-ai-700"
                        onClick={() => setScopes(scopes.filter((_, i) => i !== index))}
                      >
                        {t.removeScope}
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={() => setScopes([...scopes, blankScope(tree)])}>
                  {t.addScope}
                </button>
              </div>
            )}

            <SubmitButton pendingLabel={dict.auth.loading}>{account ? t.saveAccount : t.createAccount}</SubmitButton>
          </form>
          {account && (
            <form action={removeAction} className="mt-4 border-t border-brand-100 pt-4">
              {removeState?.error && (
                <div className="mb-3 rounded-lg bg-ai-50 px-3 py-2 text-sm text-ai-700">{errorText(removeState.error, dict.errors)}</div>
              )}
              <input type="hidden" name="id" value={account.id} />
              <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="confirm" required />
                {t.deleteAccount}
              </label>
              <SubmitButton variant="ai" pendingLabel={dict.auth.loading}>{t.deleteAccount}</SubmitButton>
            </form>
          )}
        </>
      )}
    </section>
  );
}
