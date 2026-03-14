import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function dateOffset(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting seed...\n");

  const SALT_ROUNDS = 10;
  const defaultPassword = await bcrypt.hash("Password@123", SALT_ROUNDS);

  // ── Load reference data ────────────────────────────────────────────────────
  const roles = await prisma.role.findMany();
  const roleMap = new Map(
    roles.map((r: { name: any; id: any }) => [r.name, r.id]),
  );

  const vehicleTypes = await prisma.vehicle_type.findMany();
  const vtMap = new Map(
    vehicleTypes.map((vt: { name: any; id: any }) => [vt.name, vt.id]),
  );

  const vehicleModels = await prisma.vehicle_model.findMany();
  const vmMap = new Map(
    vehicleModels.map((m: { name: any; id: any }) => [m.name, m.id]),
  );

  const docTypes = await prisma.document_type.findMany();
  const dtMap = new Map(
    docTypes.map((dt: { name: any; id: any }) => [dt.name, dt.id]),
  );

  // ── 1. Scan Centers ────────────────────────────────────────────────────────
  console.log("📍 Creating scan centers...");

  const scanCenterDefs = [
    {
      name: "Kottawa Interchange (E01)",
      city: "Pannipitiya",
      district: "Colombo",
      province: "Western",
      location: { lat: 6.8402, lng: 79.9654 },
    },
    {
      name: "Kadawatha Interchange (E02/E01)",
      city: "Kadawatha",
      district: "Gampaha",
      province: "Western",
      location: { lat: 7.0011, lng: 79.9558 },
    },
    {
      name: "Pinaduwa Interchange (E01)",
      city: "Galle",
      district: "Galle",
      province: "Southern",
      location: { lat: 6.0717, lng: 80.2452 },
    },
    {
      name: "Kurunegala Interchange (E04)",
      city: "Kurunegala",
      district: "Kurunegala",
      province: "North Western",
      location: { lat: 7.4818, lng: 80.3545 },
    },
    {
      name: "Katunayake Interchange (E03)",
      city: "Katunayake",
      district: "Gampaha",
      province: "Western",
      location: { lat: 7.1652, lng: 79.8824 },
    },
    {
      name: "Hambantota Interchange (E01)",
      city: "Hambantota",
      district: "Hambantota",
      province: "Southern",
      location: { lat: 6.1429, lng: 81.1085 },
    },
  ];

  const scanCenters = [];
  for (const def of scanCenterDefs) {
    let center = await prisma.scan_center.findFirst({
      where: { name: def.name },
    });
    if (!center) {
      center = await prisma.scan_center.create({ data: def });
      console.log(`   ✔ Created: ${def.name}`);
    } else {
      console.log(`   – Exists:  ${def.name}`);
    }
    scanCenters.push(center);
  }

  // ── 2. Fix Readers (2 per scan center) ────────────────────────────────────
  console.log("\n📡 Creating fix readers...");

  for (let i = 0; i < scanCenters.length; i++) {
    const sc = scanCenters[i];
    for (let j = 1; j <= 2; j++) {
      const serial = `RFID-${String(i + 1).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
      const readerName = `${sc.name} - Reader ${j}`;

      const existing = await prisma.fix_reader.findFirst({
        where: { serial_number: serial },
      });
      if (!existing) {
        await prisma.fix_reader.create({
          data: {
            name: readerName,
            serial_number: serial,
            model: "Impinj R420",
            location: `Gate ${j}`,
            ip_address: `192.168.${i + 1}.${j * 10}`,
            is_active: true,
            scan_center_id: sc.id,
          },
        });
        console.log(`   ✔ Created: ${readerName} [${serial}]`);
      } else {
        console.log(`   - Exists:  ${readerName} [${serial}]`);
      }
    }
  }

  // ── 3. SYSTEM_ADMIN & ADMIN Users ─────────────────────────────────────────
  console.log("\n👤 Creating system/admin users...");

  const adminUsers = [
    {
      username: "sysadmin",
      email: "sysadmin@autocomply.com",
      first_name: "System",
      last_name: "Admin",
      contact_number: "0711000001",
      nic: "199001000001",
      district: "Colombo",
      province: "Western",
      roleName: "SYSTEM_ADMIN",
    },
    {
      username: "admin",
      email: "admin@autocomply.com",
      first_name: "General",
      last_name: "Admin",
      contact_number: "0711000002",
      nic: "199001000002",
      district: "Colombo",
      province: "Western",
      roleName: "ADMIN",
    },
  ];

  for (const u of adminUsers) {
    const { roleName, ...data } = u;
    const user = await prisma.users.upsert({
      where: { username: data.username },
      update: {},
      create: {
        ...data,
        password: defaultPassword,
        role_id: roleMap.get(roleName),
      },
    });
    console.log(`   ✔ ${roleName}: ${user.username} (${user.email})`);
  }

  // ── 4. SCAN_CENTER_ADMIN & SCAN_CENTER_USER (one each per scan center) ────
  console.log("\n🏢 Creating scan center staff users...");

  for (let i = 0; i < scanCenters.length; i++) {
    const sc = scanCenters[i];
    const idx = i + 1;

    const scAdmin = await prisma.users.upsert({
      where: { username: `sc_admin_${idx}` },
      update: {},
      create: {
        username: `sc_admin_${idx}`,
        email: `sc.admin${idx}@autocomply.com`,
        password: defaultPassword,
        first_name: `Admin${idx}`,
        last_name: sc.district ?? "Staff",
        contact_number: `072100000${idx}`,
        nic: `1990020${String(idx).padStart(5, "0")}`,
        district: sc.district,
        province: sc.province,
        role_id: roleMap.get("SCAN_CENTER_ADMIN"),
        scan_center_id: sc.id,
      },
    });
    console.log(`   ✔ SCAN_CENTER_ADMIN: ${scAdmin.username} → ${sc.name}`);

    const scUser = await prisma.users.upsert({
      where: { username: `sc_user_${idx}` },
      update: {},
      create: {
        username: `sc_user_${idx}`,
        email: `sc.user${idx}@autocomply.com`,
        password: defaultPassword,
        first_name: `User${idx}`,
        last_name: sc.district ?? "Staff",
        contact_number: `073100000${idx}`,
        nic: `1995030${String(idx).padStart(5, "0")}`,
        district: sc.district,
        province: sc.province,
        role_id: roleMap.get("SCAN_CENTER_USER"),
        scan_center_id: sc.id,
      },
    });
    console.log(`   ✔ SCAN_CENTER_USER:  ${scUser.username} → ${sc.name}`);
  }

  // ── 5. OWNER Users + Vehicles + Documents ─────────────────────────────────
  console.log("\n🚗 Creating owners, vehicles and documents...");

  const ownerDefs = [
    {
      username: "owner_kamal",
      email: "kamal.perera@gmail.com",
      first_name: "Kamal",
      last_name: "Perera",
      nic: "198812300001",
      contact_number: "0771000001",
      district: "Colombo",
      province: "Western",
      vehicle: {
        reg: "CAA-1234",
        vehicleNum: "WP CAA-1234",
        chassis: "JTDBR32E500000001",
        epc: "EPC-0000-0000-0001",
        vtName: "Motor Car",
        modelName: "Corolla",
        year: 2019,
      },
    },
    {
      username: "owner_nimal",
      email: "nimal.silva@gmail.com",
      first_name: "Nimal",
      last_name: "Silva",
      nic: "199012300002",
      contact_number: "0771000002",
      district: "Kandy",
      province: "Central",
      vehicle: {
        reg: "CBB-5678",
        vehicleNum: "CP CBB-5678",
        chassis: "MHF0CX9G5S0000002",
        epc: "EPC-0000-0000-0002",
        vtName: "Motor Car",
        modelName: "Civic",
        year: 2020,
      },
    },
    {
      username: "owner_sunil",
      email: "sunil.fernando@gmail.com",
      first_name: "Sunil",
      last_name: "Fernando",
      nic: "199512300003",
      contact_number: "0771000003",
      district: "Galle",
      province: "Southern",
      vehicle: {
        reg: "SCC-9012",
        vehicleNum: "SP SCC-9012",
        chassis: "JANBB5A19PM000003",
        epc: "EPC-0000-0000-0003",
        vtName: "Motor Car",
        modelName: "Swift",
        year: 2021,
      },
    },
    {
      username: "owner_priya",
      email: "priya.jayawardena@gmail.com",
      first_name: "Priya",
      last_name: "Jayawardena",
      nic: "200012300004",
      contact_number: "0771000004",
      district: "Jaffna",
      province: "Northern",
      vehicle: {
        reg: "NDD-3456",
        vehicleNum: "NC NDD-3456",
        chassis: "KMHLM4AG8AU000004",
        epc: "EPC-0000-0000-0004",
        vtName: "Motor Car",
        modelName: "Elantra",
        year: 2018,
      },
    },
    {
      username: "owner_amara",
      email: "amara.bandara@gmail.com",
      first_name: "Amara",
      last_name: "Bandara",
      nic: "199212300005",
      contact_number: "0771000005",
      district: "Anuradhapura",
      province: "North Central",
      vehicle: {
        reg: "NCC-7890",
        vehicleNum: "NC NCC-7890",
        chassis: "TFTBZ52E800000005",
        epc: "EPC-0000-0000-0005",
        vtName: "Van",
        modelName: "D-Max",
        year: 2022,
      },
    },
  ];

  // Document date helpers
  const validStart = dateOffset(-30); // started 30 days ago
  const validEnd = dateOffset(335); // expires in ~11 months
  const expiredStart = dateOffset(-(365 + 30)); // started ~13 months ago
  const expiredEnd = dateOffset(-30); // expired 30 days ago

  for (const od of ownerDefs) {
    const { vehicle: vd, ...ownerFields } = od;

    // Create / fetch owner
    const owner = await prisma.users.upsert({
      where: { username: ownerFields.username },
      update: {},
      create: {
        ...ownerFields,
        password: defaultPassword,
        role_id: roleMap.get("OWNER"),
      },
    });

    // Create / fetch vehicle
    let vehicle = await prisma.vehicle.findFirst({ where: { epc: vd.epc } });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          registration_number: vd.reg,
          vehicle_number: vd.vehicleNum,
          chassis_number: vd.chassis,
          epc: vd.epc,
          registered_year: vd.year,
          owner_id: owner.id,
          vehicle_type_id: vtMap.get(vd.vtName) ?? null,
          vehicle_model_id: vmMap.get(vd.modelName) ?? null,
        },
      });
    }

    // Documents
    const docs: { typeName: string; refSuffix: string; valid: boolean }[] = [
      { typeName: "Insurance", refSuffix: "INS", valid: true },
      { typeName: "Revenue License", refSuffix: "RL", valid: true },
      { typeName: "Emission Test", refSuffix: "EMT", valid: false }, // intentionally expired
    ];

    for (const doc of docs) {
      const docTypeId = dtMap.get(doc.typeName);
      if (!docTypeId) {
        console.warn(
          `   ⚠ Document type "${doc.typeName}" not found – skipping`,
        );
        continue;
      }

      const existing = await prisma.document.findFirst({
        where: { vehicle_id: vehicle.id, document_type_id: docTypeId },
      });
      if (!existing) {
        await prisma.document.create({
          data: {
            vehicle_id: vehicle.id,
            document_type_id: docTypeId,
            reference_number: `${doc.refSuffix}-${vd.reg}-2024`,
            start_date: doc.valid ? validStart : expiredStart,
            end_date: doc.valid ? validEnd : expiredEnd,
          },
        });
      }
    }

    console.log(
      `   ✔ OWNER: ${owner.username} | Vehicle: ${vd.reg} (${vd.modelName}) | Docs: Insurance ✓  Revenue License ✓  Emission Test ✗ (expired)`,
    );
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Default credentials for all seeded users:");
  console.log("   Password: Password@123\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
