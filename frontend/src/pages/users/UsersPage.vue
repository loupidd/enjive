<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">
          {{ t("users.title") }}
        </h2>
        <div class="accent-bar mt-1.5" />
      </div>
      <button
        v-if="isAdmin"
        class="btn-primary text-xs gap-1.5 px-3"
        @click="openCreate"
      >
        <IconPlus :size="13" /> {{ t("users.add") }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-0 overflow-hidden">
      <div
        class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-denim-700/30"
      >
        <div class="px-4 py-3">
          <label
            class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
            >Site</label
          >
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="s in SITES"
              :key="s.key"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="
                filters.site === s.key
                  ? 'bg-caramel/15 border-caramel/40 text-caramel font-semibold'
                  : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
              "
              @click="filters.site = filters.site === s.key ? '' : s.key"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="px-4 py-3">
          <label
            class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
            >{{ t("common.status") }}</label
          >
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="s in STATUSES"
              :key="s.key"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="
                filters.status === s.key
                  ? s.activeClass
                  : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
              "
              @click="filters.status = filters.status === s.key ? '' : s.key"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
        <div class="px-4 py-3">
          <label
            class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
            >Level</label
          >
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="lv in LEVELS"
              :key="lv"
              class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
              :class="
                filters.level === lv
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold'
                  : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
              "
              @click="filters.level = filters.level === lv ? '' : lv"
            >
              {{ lv }}
            </button>
          </div>
        </div>
      </div>
      <div
        class="flex items-center gap-3 px-4 py-2.5 border-t border-denim-700/20"
      >
        <div class="relative flex-1 max-w-xs">
          <IconSearch
            :size="13"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-denim-200/30"
          />
          <input
            v-model="search"
            class="input pl-8 py-1.5 text-xs"
            :placeholder="t('common.search') + ' name, email...'"
          />
          <button
            v-if="search"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-denim-200/30 hover:text-white"
            @click="search = ''"
          >
            <IconX :size="12" />
          </button>
        </div>
        <span class="text-xs text-denim-200/30 ml-auto"
          >{{ filteredUsers.length }} {{ t("users.title").toLowerCase() }}</span
        >
        <button
          v-if="hasFilters"
          class="text-[11px] text-caramel/70 hover:text-caramel"
          @click="resetFilters"
        >
          {{ t("common.reset") }}
        </button>
      </div>
    </div>

    <!-- Loading / error -->
    <div
      v-if="userLoading"
      class="flex items-center gap-2 text-xs text-denim-200/40 py-2"
    >
      <svg
        class="animate-spin w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {{ t("common.loading") }}
    </div>
    <div
      v-if="userError"
      class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
    >
      {{ userError }}
    </div>

    <!-- Table -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px]">
          <thead>
            <tr class="border-b border-denim-700/30 bg-denim-900/20">
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-10"
              >
                No
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
              >
                {{ t("common.name") }}
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
              >
                {{ t("users.email") }}
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
              >
                Site
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
              >
                {{ t("users.level") }}
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
              >
                {{ t("users.position") }}
              </th>
              <th
                class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-20"
              >
                {{ t("common.status") }}
              </th>
              <th v-if="isAdmin" class="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, i) in pagedUsers"
              :key="user.id"
              class="border-b border-denim-700/10 hover:bg-denim-700/10 transition-colors group"
            >
              <td class="px-4 py-3 text-[11px] text-denim-200/25">
                {{ (page - 1) * PER_PAGE + i + 1 }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    :style="{ background: avatarColor(user.name) }"
                  >
                    {{ initials(user.name) }}
                  </div>
                  <span class="text-xs font-medium text-white">{{
                    user.name
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-[11px] text-denim-200/50">
                {{ user.email }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  :class="
                    user.site === 'EDA'
                      ? 'bg-blue-500/15 text-blue-300'
                      : user.site === 'NFP'
                        ? 'bg-purple-500/15 text-purple-300'
                        : 'bg-denim-600/40 text-denim-200/50'
                  "
                >
                  {{ user.site }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  :class="levelColor(user.level)"
                  >{{ user.level }}</span
                >
              </td>
              <td class="px-4 py-3 text-[11px] text-denim-200/50">
                {{ user.role }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  :class="
                    user.status === 'Active'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-red-500/15 text-red-400'
                  "
                >
                  {{ user.status }}
                </span>
              </td>
              <td v-if="isAdmin" class="px-3 py-3">
                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="w-6 h-6 flex items-center justify-center rounded hover:bg-denim-600/50 text-denim-200/50 hover:text-white"
                    @click="openEdit(user)"
                  >
                    <IconPencil :size="12" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!userLoading && !pagedUsers.length">
              <td :colspan="isAdmin ? 8 : 7" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-14 h-14 rounded-2xl bg-denim-700/30 flex items-center justify-center"
                  >
                    <IconSearch :size="24" class="text-denim-200/20" />
                  </div>
                  <p class="text-xs text-denim-200/30">
                    {{ t("users.noUsers") }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-denim-700/20"
      >
        <p class="text-xs text-denim-200/30">
          {{ (page - 1) * PER_PAGE + 1 }}–{{
            Math.min(page * PER_PAGE, filteredUsers.length)
          }}
          of {{ filteredUsers.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            class="btn-secondary px-2.5 py-1 text-xs"
            :disabled="page === 1"
            @click="page--"
          >
            ← {{ t("common.prev") }}
          </button>
          <span class="text-xs text-denim-200/40 px-2"
            >{{ page }}/{{ totalPages }}</span
          >
          <button
            class="btn-secondary px-2.5 py-1 text-xs"
            :disabled="page === totalPages"
            @click="page++"
          >
            {{ t("common.next") }} →
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal (admin only — read-only for now, real CRUD via API) -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16"
          @click.self="showModal = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-lg"
          >
            <div
              class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10"
            >
              <h2 class="text-sm font-bold text-white">
                {{ editMode ? t("common.edit") + " User" : t("users.add") }}
              </h2>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
                @click="showModal = false"
              >
                <IconX :size="14" />
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div
                v-if="formError"
                class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
              >
                {{ formError }}
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >First Name <span class="text-red-400">*</span></label
                  >
                  <input
                    v-model="form.firstName"
                    class="input text-sm"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label class="label"
                    >Last Name <span class="text-red-400">*</span></label
                  >
                  <input
                    v-model="form.lastName"
                    class="input text-sm"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label class="label"
                  >{{ t("users.email") }}
                  <span class="text-red-400">*</span></label
                >
                <input
                  v-model="form.email"
                  type="email"
                  class="input text-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div v-if="!editMode">
                <label class="label"
                  >Password <span class="text-red-400">*</span></label
                >
                <input
                  v-model="form.password"
                  type="password"
                  class="input text-sm"
                  placeholder="Min 8 characters"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label"
                    >Role <span class="text-red-400">*</span></label
                  >
                  <select v-model="form.role" class="input text-sm">
                    <option value="">{{ t("common.all") }}</option>
                    <option
                      v-for="opt in ROLE_OPTIONS"
                      :key="opt.role"
                      :value="opt.role"
                    >
                      {{ opt.level }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="label">Site</label>
                  <select v-model="form.site" class="input text-sm">
                    <option value="EDA">EDA</option>
                    <option value="NFP">NFP</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>
            </div>
            <div
              class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2"
            >
              <button class="btn-secondary text-xs" @click="showModal = false">
                {{ t("common.cancel") }}
              </button>
              <button
                class="btn-primary text-xs gap-1.5"
                @click="saveUser"
                :disabled="
                  !form.firstName ||
                  !form.email ||
                  (!editMode && !form.password) ||
                  formSaving
                "
              >
                <svg
                  v-if="formSaving"
                  class="animate-spin w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {{ editMode ? t("common.save") : t("users.add") }}
              </button>
            </div>
          </div>
        </div>
      </Transition> </Teleport
    >er justify-between flex-wrap gap-3">
    <div>
      <h2 class="text-xl font-bold text-white tracking-tight">
        {{ t("users.title") }}
      </h2>
      <div class="accent-bar mt-1.5" />
    </div>
    <button
      v-if="isAdmin"
      class="btn-primary text-xs gap-1.5 px-3"
      @click="openCreate"
    >
      <IconPlus :size="13" /> {{ t("users.add") }}
    </button>
  </div>

  <!-- Filters -->
  <div class="card p-0 overflow-hidden">
    <div
      class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-denim-700/30"
    >
      <div class="px-4 py-3">
        <label
          class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
          >Site</label
        >
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="s in SITES"
            :key="s.key"
            class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
            :class="
              filters.site === s.key
                ? 'bg-caramel/15 border-caramel/40 text-caramel font-semibold'
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
            "
            @click="filters.site = filters.site === s.key ? '' : s.key"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
      <div class="px-4 py-3">
        <label
          class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
          >{{ t("common.status") }}</label
        >
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="s in STATUSES"
            :key="s.key"
            class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
            :class="
              filters.status === s.key
                ? s.activeClass
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
            "
            @click="filters.status = filters.status === s.key ? '' : s.key"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
      <div class="px-4 py-3">
        <label
          class="text-[10px] font-semibold text-denim-200/40 uppercase tracking-wide block mb-1.5"
          >Level</label
        >
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="lv in LEVELS"
            :key="lv"
            class="text-[11px] px-2.5 py-1 rounded-md border transition-all"
            :class="
              filters.level === lv
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold'
                : 'border-denim-600/30 text-denim-200/40 hover:text-denim-200/70'
            "
            @click="filters.level = filters.level === lv ? '' : lv"
          >
            {{ lv }}
          </button>
        </div>
      </div>
    </div>
    <div
      class="flex items-center gap-3 px-4 py-2.5 border-t border-denim-700/20"
    >
      <div class="relative flex-1 max-w-xs">
        <IconSearch
          :size="13"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-denim-200/30"
        />
        <input
          v-model="search"
          class="input pl-8 py-1.5 text-xs"
          :placeholder="t('common.search') + ' name, email...'"
        />
        <button
          v-if="search"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-denim-200/30 hover:text-white"
          @click="search = ''"
        >
          <IconX :size="12" />
        </button>
      </div>
      <span class="text-xs text-denim-200/30 ml-auto"
        >{{ filteredUsers.length }} {{ t("users.title").toLowerCase() }}</span
      >
      <button
        v-if="hasFilters"
        class="text-[11px] text-caramel/70 hover:text-caramel"
        @click="resetFilters"
      >
        {{ t("common.reset") }}
      </button>
    </div>
  </div>

  <!-- Loading / error -->
  <div
    v-if="userLoading"
    class="flex items-center gap-2 text-xs text-denim-200/40 py-2"
  >
    <svg
      class="animate-spin w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    {{ t("common.loading") }}
  </div>
  <div
    v-if="userError"
    class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
  >
    {{ userError }}
  </div>

  <!-- Table -->
  <div class="card p-0 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px]">
        <thead>
          <tr class="border-b border-denim-700/30 bg-denim-900/20">
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-10"
            >
              No
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
            >
              {{ t("common.name") }}
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
            >
              {{ t("users.email") }}
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
            >
              Site
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
            >
              {{ t("users.level") }}
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide"
            >
              {{ t("users.position") }}
            </th>
            <th
              class="px-4 py-2.5 text-left text-[10px] font-semibold text-denim-200/35 uppercase tracking-wide w-20"
            >
              {{ t("common.status") }}
            </th>
            <th v-if="isAdmin" class="px-4 py-2.5 w-16" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, i) in pagedUsers"
            :key="user.id"
            class="border-b border-denim-700/10 hover:bg-denim-700/10 transition-colors group"
          >
            <td class="px-4 py-3 text-[11px] text-denim-200/25">
              {{ (page - 1) * PER_PAGE + i + 1 }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  :style="{ background: avatarColor(user.name) }"
                >
                  {{ initials(user.name) }}
                </div>
                <span class="text-xs font-medium text-white">{{
                  user.name
                }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-[11px] text-denim-200/50">
              {{ user.email }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                :class="
                  user.site === 'EDA'
                    ? 'bg-blue-500/15 text-blue-300'
                    : user.site === 'NFP'
                      ? 'bg-purple-500/15 text-purple-300'
                      : 'bg-denim-600/40 text-denim-200/50'
                "
              >
                {{ user.site }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                :class="levelColor(user.level)"
                >{{ user.level }}</span
              >
            </td>
            <td class="px-4 py-3 text-[11px] text-denim-200/50">
              {{ user.role }}
            </td>
            <td class="px-4 py-3">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                :class="
                  user.status === 'Active'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-red-500/15 text-red-400'
                "
              >
                {{ user.status }}
              </span>
            </td>
            <td v-if="isAdmin" class="px-3 py-3">
              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-denim-600/50 text-denim-200/50 hover:text-white"
                  @click="openEdit(user)"
                >
                  <IconPencil :size="12" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!userLoading && !pagedUsers.length">
            <td :colspan="isAdmin ? 8 : 7" class="px-4 py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-14 h-14 rounded-2xl bg-denim-700/30 flex items-center justify-center"
                >
                  <IconSearch :size="24" class="text-denim-200/20" />
                </div>
                <p class="text-xs text-denim-200/30">
                  {{ t("users.noUsers") }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-4 py-3 border-t border-denim-700/20"
    >
      <p class="text-xs text-denim-200/30">
        {{ (page - 1) * PER_PAGE + 1 }}–{{
          Math.min(page * PER_PAGE, filteredUsers.length)
        }}
        of {{ filteredUsers.length }}
      </p>
      <div class="flex items-center gap-1">
        <button
          class="btn-secondary px-2.5 py-1 text-xs"
          :disabled="page === 1"
          @click="page--"
        >
          ← {{ t("common.prev") }}
        </button>
        <span class="text-xs text-denim-200/40 px-2"
          >{{ page }}/{{ totalPages }}</span
        >
        <button
          class="btn-secondary px-2.5 py-1 text-xs"
          :disabled="page === totalPages"
          @click="page++"
        >
          {{ t("common.next") }} →
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Modal (admin only — read-only for now, real CRUD via API) -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16"
        @click.self="showModal = false"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          class="relative bg-denim-800 border border-denim-600/50 rounded-2xl shadow-2xl w-full max-w-lg"
        >
          <div
            class="sticky top-0 bg-denim-800 flex items-center justify-between px-6 py-4 border-b border-denim-700/40 z-10"
          >
            <h2 class="text-sm font-bold text-white">
              {{ editMode ? t("common.edit") + " User" : t("users.add") }}
            </h2>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-denim-200/50"
              @click="showModal = false"
            >
              <IconX :size="14" />
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label"
                  >{{ t("common.name") }}
                  <span class="text-red-400">*</span></label
                >
                <div class="grid grid-cols-2 gap-3">
                  <input
                    v-model="form.firstName"
                    class="input text-sm"
                    placeholder="First name"
                  />
                  <input
                    v-model="form.lastName"
                    class="input text-sm"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label class="label"
                  >{{ t("users.email") }}
                  <span class="text-red-400">*</span></label
                >
                <input
                  v-model="form.email"
                  type="email"
                  class="input text-sm"
                  placeholder="user@example.com"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label"
                  >Level <span class="text-red-400">*</span></label
                >
                <select v-model="form.role" class="input text-sm">
                  <option value="ADMIN">Administrator</option>
                  <option value="MANAGER">Supervisor</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div>
                <label class="label">{{ t("common.status") }}</label>
                <select v-model="form.status" class="input text-sm">
                  <option>Active</option>
                  <option>Disable</option>
                </select>
              </div>
            </div>
          </div>
          <div
            class="sticky bottom-0 bg-denim-800 border-t border-denim-700/40 px-6 py-4 flex justify-end gap-2"
          >
            <button class="btn-secondary text-xs" @click="showModal = false">
              {{ t("common.cancel") }}
            </button>
            <button class="btn-primary text-xs">{{ t("common.save") }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IconPlus, IconPencil, IconX, IconSearch } from "@/components/icons";
import { useUsers } from "@/composables/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n";

const { t } = useI18n();
const auth = useAuthStore();
const isAdmin = computed(() =>
  ["ADMIN", "SUPER_ADMIN"].includes(auth.userRole ?? ""),
);

const {
  items: apiUsers,
  loading: userLoading,
  error: userError,
  saving: userSaving,
  fetch: fetchUsers,
  create: createUser,
  update: updateUser,
} = useUsers();
onMounted(() => fetchUsers());

const SITES = [
  { key: "", label: "All" },
  { key: "EDA", label: "EDA" },
  { key: "NFP", label: "NFP" },
  { key: "BOTH", label: "Both" },
];
const STATUSES = [
  {
    key: "",
    label: "All",
    activeClass: "border-denim-500/50 text-denim-200/70 bg-denim-700/20",
  },
  {
    key: "Active",
    label: "Active",
    activeClass:
      "bg-green-500/15 border-green-500/40 text-green-400 font-semibold",
  },
  {
    key: "Disable",
    label: "Disable",
    activeClass: "bg-red-500/15 border-red-500/40 text-red-400 font-semibold",
  },
];
const LEVELS = [
  "Administrator",
  "Engineer",
  "Supervisor",
  "Technician",
  "Viewer",
  "Guest",
];
const PER_PAGE = 10;

const LEVEL_COLORS = new Map([
  ["Administrator", "bg-red-500/15 text-red-300"],
  ["Engineer", "bg-blue-500/15 text-blue-300"],
  ["Supervisor", "bg-purple-500/15 text-purple-300"],
  ["Technician", "bg-caramel/15 text-caramel"],
  ["Viewer", "bg-denim-600/40 text-denim-200/60"],
  ["Guest", "bg-denim-600/30 text-denim-200/40"],
]);
function levelColor(lv: string) {
  return LEVEL_COLORS.get(lv) ?? "bg-denim-600/30 text-denim-200";
}

const PALETTE = [
  "#7A4A00",
  "#02314E",
  "#1e40af",
  "#065f46",
  "#7c3aed",
  "#be185d",
  "#b45309",
];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[Math.abs(h)];
}
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const ROLE_TO_LEVEL: Record<string, string> = {
  SUPER_ADMIN: "Administrator",
  ADMIN: "Administrator",
  MANAGER: "Supervisor",
  TECHNICIAN: "Technician",
  VIEWER: "Viewer",
};

const LEVEL_TO_ROLE: Record<string, string> = {
  Administrator: "ADMIN",
  Supervisor: "MANAGER",
  Technician: "TECHNICIAN",
  Viewer: "VIEWER",
};

const ROLE_OPTIONS = Object.entries(ROLE_TO_LEVEL).map(([role, level]) => ({
  role,
  level,
}));

const users = computed(() =>
  apiUsers.value.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    site: (u as any).site ?? "EDA",
    level: ROLE_TO_LEVEL[u.role] ?? u.role,
    role: u.role,
    status: u.status === "ACTIVE" ? "Active" : "Disable",
  })),
);

const filters = ref({ site: "", status: "", level: "" });
const search = ref("");
const page = ref(1);

const hasFilters = computed(
  () =>
    !!(
      filters.value.site ||
      filters.value.status ||
      filters.value.level ||
      search.value
    ),
);
function resetFilters() {
  filters.value = { site: "", status: "", level: "" };
  search.value = "";
  page.value = 1;
}

const filteredUsers = computed(() => {
  let list = users.value;
  if (filters.value.site)
    list = list.filter(
      (u) =>
        u.site === filters.value.site ||
        (filters.value.site === "BOTH" && u.site === "BOTH"),
    );
  if (filters.value.status)
    list = list.filter((u) => u.status === filters.value.status);
  if (filters.value.level)
    list = list.filter((u) => u.level === filters.value.level);
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / PER_PAGE)),
);
const pagedUsers = computed(() =>
  filteredUsers.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE),
);

// Modal (add/edit)
const showModal = ref(false);
const editMode = ref(false);
const editingId = ref<string | null>(null);
const formSaving = ref(false);
const formError = ref<string | null>(null);
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "TECHNICIAN",
  site: "EDA",
  status: "Active",
});
function openCreate() {
  editMode.value = false;
  editingId.value = null;
  formError.value = null;
  form.value = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "TECHNICIAN",
    site: "EDA",
    status: "Active",
  };
  showModal.value = true;
}
function openEdit(user: any) {
  editMode.value = true;
  editingId.value = user.id;
  formError.value = null;
  form.value = {
    firstName: user.name.split(" ")[0] ?? "",
    lastName: user.name.split(" ").slice(1).join(" ") ?? "",
    email: user.email,
    password: "",
    role: user.role,
    site: user.site ?? "EDA",
    status: user.status,
  };
  showModal.value = true;
}
async function saveUser() {
  if (formSaving.value) return;
  formError.value = null;
  formSaving.value = true;
  try {
    const levelToRole: Record<string, string> = {
      Administrator: "ADMIN",
      Supervisor: "MANAGER",
      Technician: "TECHNICIAN",
      Viewer: "VIEWER",
    };
    const role = levelToRole[form.value.role] ?? form.value.role;
    if (editMode.value && editingId.value) {
      await updateUser(editingId.value, {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        role: role as any,
      });
    } else {
      await createUser({
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        role,
      });
    }
    await fetchUsers();
    showModal.value = false;
  } catch (e: any) {
    formError.value = e?.message ?? "Failed to save user";
  } finally {
    formSaving.value = false;
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
