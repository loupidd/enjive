import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();
const __dir = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🌱  Seeding database...");

  // ── Users — real hashes from Soluman export ───────────────────
  // $2y$ (PHP) → $2b$ (Node bcryptjs) — same algorithm, different prefix
  const userDefs: any[] = JSON.parse(
    readFileSync(join(__dir, "users_seed.json"), "utf8"),
  );

  const users: any[] = [];
  for (const u of userDefs) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.hash, site: u.site, status: u.status as any },
      create: {
        email: u.email,
        passwordHash: u.hash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as any,
        status: u.status as any,
        site: u.site,
      },
    });
    users.push(created);
  }
  console.log(
    `✅  ${users.length} users seeded (real passwords from legacy system)`,
  );

  const adminUser =
    users.find((u) => u.email === "s3.solusi@gmail.com") ?? users[0];
  const techUser =
    users.find((u) => u.email === "teknisi1@sssolusindo.com") ?? users[0];

  // ── Equipment — all 4,660 from Soluman export ─────────────────
  const eqRaw: any[] = JSON.parse(
    readFileSync(join(__dir, "equipment_seed.json"), "utf8"),
  );

  let eqCount = 0;
  const BATCH = 200;
  for (let i = 0; i < eqRaw.length; i += BATCH) {
    const batch = eqRaw.slice(i, i + BATCH);
    await Promise.all(
      batch.map((e: any) =>
        prisma.equipment
          .upsert({
            where: { code: e.code },
            update: {
              name: e.name,
              category: e.category,
              location: e.location,
              site: e.site,
            },
            create: {
              code: e.code,
              name: e.name,
              category: e.category,
              location: e.location || "",
              site: e.site,
              status: "OPERATIONAL",
              description: `${e.category} · ${e.site} · Lantai ${e.location || "?"}`,
            },
          })
          .catch(() => null),
      ),
    );
    eqCount += batch.length;
    if (i % 1000 === 0)
      process.stdout.write(`  equipment ${i}/${eqRaw.length}\r`);
  }
  console.log(`✅  ${eqCount} equipment seeded (3,045 EDA + 1,615 NFP)`);

  // ── Fetch sample equipment for WO/Schedule seeding ────────────
  const edaEq = await prisma.equipment.findMany({
    where: { site: "EDA", deletedAt: null },
    take: 30,
  });
  const nfpEq = await prisma.equipment.findMany({
    where: { site: "NFP", deletedAt: null },
    take: 15,
  });
  if (!edaEq.length) {
    console.log("⚠️  No equipment found — skipping WOs");
    return;
  }

  // ── Schedules ──────────────────────────────────────────────────
  const schedDefs = [
    {
      id: "s1",
      title: "PM AC Bulanan EDA",
      freq: "MONTHLY",
      act: "CLEANING",
      eq: edaEq[0],
    },
    {
      id: "s2",
      title: "PM Panel Listrik 3 Bulanan EDA",
      freq: "QUARTERLY",
      act: "INSPECTION",
      eq: edaEq[1],
    },
    {
      id: "s3",
      title: "PM Genset Bulanan EDA",
      freq: "MONTHLY",
      act: "TESTING",
      eq: edaEq[2],
    },
    {
      id: "s4",
      title: "Thermographic 6 Bulanan EDA",
      freq: "ANNUALLY",
      act: "INSPECTION",
      eq: edaEq[1],
    },
    {
      id: "s5",
      title: "PM Fire Alarm Tahunan EDA",
      freq: "ANNUALLY",
      act: "TESTING",
      eq: edaEq[4],
    },
    {
      id: "s6",
      title: "PM AC Bulanan NFP",
      freq: "MONTHLY",
      act: "CLEANING",
      eq: nfpEq[0],
    },
    {
      id: "s7",
      title: "PM Panel NFP 3 Bulanan",
      freq: "QUARTERLY",
      act: "INSPECTION",
      eq: nfpEq[1],
    },
    {
      id: "s8",
      title: "PM Pompa Berkala EDA",
      freq: "QUARTERLY",
      act: "MAINTENANCE",
      eq: edaEq[5],
    },
    {
      id: "s9",
      title: "PM CCTV Bulanan EDA",
      freq: "MONTHLY",
      act: "INSPECTION",
      eq: edaEq[3],
    },
    {
      id: "s10",
      title: "PM Lift NFP Bulanan",
      freq: "MONTHLY",
      act: "MAINTENANCE",
      eq: nfpEq[2],
    },
  ];
  let schedCount = 0;
  for (const s of schedDefs) {
    await prisma.schedule
      .upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          title: s.title,
          frequency: s.freq as any,
          activityType: s.act as any,
          startDate: new Date("2024-01-01"),
          nextRunAt: new Date(),
          isActive: true,
          equipmentId: s.eq.id,
          estimatedHours: 2,
        },
      })
      .catch(() => null);
    schedCount++;
  }
  console.log(`✅  ${schedCount} schedules seeded`);

  // ── Work Orders ────────────────────────────────────────────────
  const woDefs = [
    {
      code: "EDA-WO-001",
      title: "Cleaning AC East Tower",
      type: "PREVENTIVE",
      status: "COMPLETED",
      pri: "MEDIUM",
      eq: edaEq[0],
    },
    {
      code: "EDA-WO-002",
      title: "PM Panel Listrik MDP",
      type: "PREVENTIVE",
      status: "COMPLETED",
      pri: "MEDIUM",
      eq: edaEq[1],
    },
    {
      code: "EDA-WO-003",
      title: "Pengecekan Pompa Air Bersih",
      type: "CORRECTIVE",
      status: "COMPLETED",
      pri: "HIGH",
      eq: edaEq[5],
    },
    {
      code: "EDA-WO-004",
      title: "Steam Evaporator AC Lobby",
      type: "CORRECTIVE",
      status: "COMPLETED",
      pri: "HIGH",
      eq: edaEq[0],
    },
    {
      code: "EDA-WO-005",
      title: "Thermographic Investigation",
      type: "INSPECTION",
      status: "COMPLETED",
      pri: "MEDIUM",
      eq: edaEq[1],
    },
    {
      code: "EDA-WO-006",
      title: "Pengecekan Fire Alarm Zone 5",
      type: "INSPECTION",
      status: "COMPLETED",
      pri: "HIGH",
      eq: edaEq[4],
    },
    {
      code: "EDA-WO-007",
      title: "Cleaning CCTV System",
      type: "PREVENTIVE",
      status: "COMPLETED",
      pri: "LOW",
      eq: edaEq[3],
    },
    {
      code: "EDA-WO-008",
      title: "PM Genset 250kVA Berkala",
      type: "PREVENTIVE",
      status: "COMPLETED",
      pri: "HIGH",
      eq: edaEq[2],
    },
    {
      code: "EDA-WO-009",
      title: "Pengecekan Boomgate East",
      type: "CORRECTIVE",
      status: "COMPLETED",
      pri: "MEDIUM",
      eq: edaEq[6],
    },
    {
      code: "EDA-WO-010",
      title: "Pergantian Fan Outdoor AC",
      type: "CORRECTIVE",
      status: "COMPLETED",
      pri: "HIGH",
      eq: edaEq[0],
    },
    {
      code: "EDA-WO-011",
      title: "PM AC Q1 2024",
      type: "PREVENTIVE",
      status: "OPEN",
      pri: "MEDIUM",
      eq: edaEq[0],
    },
    {
      code: "EDA-WO-012",
      title: "Pengecekan Magnetik Door",
      type: "CORRECTIVE",
      status: "ASSIGNED",
      pri: "MEDIUM",
      eq: edaEq[6],
    },
    {
      code: "EDA-WO-013",
      title: "Tambahan Freon R410A",
      type: "CORRECTIVE",
      status: "IN_PROGRESS",
      pri: "HIGH",
      eq: edaEq[0],
    },
    {
      code: "EDA-WO-014",
      title: "Thermographic Annual Panel",
      type: "INSPECTION",
      status: "OPEN",
      pri: "MEDIUM",
      eq: edaEq[1],
    },
    {
      code: "NFP-WO-001",
      title: "PM AC NFP Tower A",
      type: "PREVENTIVE",
      status: "OPEN",
      pri: "MEDIUM",
      eq: nfpEq[0],
    },
  ];

  let woCount = 0;
  for (const w of woDefs) {
    await prisma.workOrder
      .upsert({
        where: { code: w.code },
        update: {},
        create: {
          code: w.code,
          title: w.title,
          type: w.type as any,
          status: w.status as any,
          priority: w.pri as any,
          equipmentId: w.eq.id,
          createdById: adminUser.id,
          assignedToId: w.status !== "OPEN" ? techUser.id : undefined,
          dueDate: new Date(Date.now() + 7 * 86400000),
          estimatedHours: 2,
          ...(w.status === "COMPLETED"
            ? { completedAt: new Date(), actualHours: 2.5 }
            : {}),
        },
      })
      .catch(() => null);
    woCount++;
  }
  console.log(`✅  ${woCount} work orders seeded`);

  // ── Trouble Reports ────────────────────────────────────────────
  const trDefs = [
    {
      code: "EDA-TR-001",
      title: "AC Bocor Lobby",
      desc: "AC split lobby bocor.",
      sev: "HIGH",
      status: "CLOSED",
      eq: edaEq[0],
    },
    {
      code: "EDA-TR-002",
      title: "Panel Trip Berulang",
      desc: "MCB panel MDP trip berulang kali.",
      sev: "CRITICAL",
      status: "RESOLVED",
      eq: edaEq[1],
    },
    {
      code: "EDA-TR-003",
      title: "CCTV Offline Parking",
      desc: "Beberapa kamera CCTV area parkir offline.",
      sev: "MEDIUM",
      status: "CLOSED",
      eq: edaEq[3],
    },
    {
      code: "EDA-TR-004",
      title: "AC Tidak Dingin",
      desc: "AC meeting room tidak mendinginkan.",
      sev: "MEDIUM",
      status: "IN_PROGRESS",
      eq: edaEq[0],
    },
    {
      code: "EDA-TR-005",
      title: "Genset Gagal Start",
      desc: "Genset gagal start saat test bulanan.",
      sev: "CRITICAL",
      status: "ACKNOWLEDGED",
      eq: edaEq[2],
    },
    {
      code: "NFP-TR-001",
      title: "Pompa Air NFP Mati",
      desc: "Pompa air utama NFP tidak bisa menyala.",
      sev: "CRITICAL",
      status: "OPEN",
      eq: nfpEq[0],
    },
  ];
  let trCount = 0;
  for (const t of trDefs) {
    await prisma.troubleReport
      .upsert({
        where: { code: t.code },
        update: {},
        create: {
          code: t.code,
          title: t.title,
          description: t.desc,
          severity: t.sev as any,
          status: t.status as any,
          equipmentId: t.eq.id,
          reportedById: adminUser.id,
          ...(["CLOSED", "RESOLVED"].includes(t.status)
            ? { resolvedAt: new Date() }
            : {}),
        },
      })
      .catch(() => null);
    trCount++;
  }
  console.log(`✅  ${trCount} trouble reports seeded`);
  console.log("✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
