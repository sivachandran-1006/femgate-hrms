import { useState } from "react";
import {
  IconFolder, IconUpload, IconDownload, IconEye,
  IconTrash, IconFile, IconX, IconChevronDown, IconShieldCheck,
} from "@tabler/icons-react";
import { useAuth }              from "../../hooks/useAuth";
import { useMyDocuments, useCreateDocument, useDeleteDocument } from "../../queries/useSelfService";
import { useToast }             from "../../components/ui/Toast";
import { Stack, Group }        from "@mantine/core";
import { AppModal }  from "../../components/ui/AppModal";
import { AppInput }  from "../../components/ui/AppInput";
import { AppButton } from "../../components/ui/AppButton";
import { AppPageHeader } from "../../components/ui/AppPageHeader";
import { COLORS }               from "../../theme/colors";
import { FONT_SIZE, FONT_WEIGHT, FONT_FAMILY } from "../../theme/fonts";
import { SPACING, GAP, PADDING } from "../../theme/spacing";
import { RADIUS, SHADOW }       from "../../theme/sizes";

const mapApiDoc = (d) => ({
  id:         d.id,
  name:       d.name,
  category:   d.category || "Other",
  uploadDate: (d.createdAt || "").split("T")[0],
  status:     d.expiryDate && new Date(d.expiryDate) < new Date() ? "Expired" : "Verified",
  size:       d.fileSize || "—",
});

const CATEGORIES = ["All","Identity","Education","Employment","Financial","Other"];

const STATUS_STYLE = {
  Verified: { bg:COLORS.successLight, color:COLORS.success },
  Pending:  { bg:COLORS.warningLight, color:COLORS.warning },
  Expired:  { bg:COLORS.dangerMuted,  color:COLORS.danger  },
};

const CAT_STYLE = {
  Identity:   { bg:COLORS.primaryMuted, color:COLORS.primary },
  Education:  { bg:COLORS.purpleMuted,  color:COLORS.purple  },
  Employment: { bg:COLORS.infoLight,    color:COLORS.info    },
  Financial:  { bg:COLORS.successLight, color:COLORS.success },
  Other:      { bg:COLORS.gray200,      color:COLORS.gray600 },
};

const MyDocuments = ({ darkMode: dark = false }) => {
  const { user }  = useAuth();
  const { show }  = useToast();
  const surface   = dark ? COLORS.dark : COLORS.light;
  const [catFilter,setCatFilter] = useState("All");
  const [showUpload,setShowUpload] = useState(false);
  const [fileName, setFileName]   = useState("No file chosen");
  const [form, setForm] = useState({ name:"", category:"Identity" });

  const { data: docsRaw = [] } = useMyDocuments();
  const createMut = useCreateDocument();
  const deleteMut = useDeleteDocument();

  const docs = docsRaw.map(mapApiDoc);
  const filtered = docs.filter((d)=>catFilter==="All"||d.category===catFilter);

  const handleUpload = async () => {
    if (!form.name.trim()) return;
    try {
      await createMut.mutateAsync({
        name:     form.name,
        category: form.category,
        fileUrl:  `/files/${form.name.toLowerCase().replace(/\s+/g, "-")}`,
        fileSize: fileName !== "No file chosen" ? fileName : null,
      });
      show(`"${form.name}" uploaded`, "success");
      setForm({ name:"", category:"Identity" });
      setFileName("No file chosen");
      setShowUpload(false);
    } catch {
      show("Failed to upload document", "error");
    }
  };

  const handleDelete = async (doc) => {
    try {
      await deleteMut.mutateAsync(doc.id);
      show(`"${doc.name}" deleted`, "error");
    } catch {
      show("Failed to delete document", "error");
    }
  };

  const Card = ({ children, style={} }) => (
    <div style={{ background:surface.cardBg, borderRadius:RADIUS["2xl"], border:`1px solid ${surface.border}`, boxShadow:SHADOW.sm, ...style }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily:FONT_FAMILY.base }}>

      <AppPageHeader
        title="My Documents"
        sub="Upload and manage your personal documents"
        action={<AppButton onClick={() => setShowUpload(true)} leftSection={<IconUpload size={16} />}>Upload Document</AppButton>}
      />

      {/* Stat chips */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:GAP.md, marginBottom:SPACING[5] }}>
        {[
          { label:"Total",    value:docs.length,                                   color:COLORS.primary, bg:COLORS.primaryMuted },
          { label:"Verified", value:docs.filter(d=>d.status==="Verified").length,  color:COLORS.success, bg:COLORS.successLight },
          { label:"Pending",  value:docs.filter(d=>d.status==="Pending").length,   color:COLORS.warning, bg:COLORS.warningLight },
          { label:"Expired",  value:docs.filter(d=>d.status==="Expired").length,   color:COLORS.danger,  bg:COLORS.dangerMuted  },
        ].map((s)=>(
          <div key={s.label} style={{ background:surface.cardBg,borderRadius:RADIUS["2xl"],border:`1px solid ${surface.border}`,boxShadow:SHADOW.sm,padding:`${SPACING[4]}px`,display:"flex",alignItems:"center",gap:GAP.md }}>
            <div style={{ width:44,height:44,borderRadius:RADIUS.xl,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <IconFolder size={20} color={s.color} stroke={1.8}/>
            </div>
            <div>
              <p style={{ margin:0,fontSize:FONT_SIZE.xs,color:surface.subtext }}>{s.label} Documents</p>
              <p style={{ margin:0,fontSize:FONT_SIZE["2xl"],fontWeight:FONT_WEIGHT.bold,color:s.color,lineHeight:1.1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <Card>
        {/* Filter bar */}
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:GAP.sm, padding:`${SPACING[4]}px ${SPACING[5]}px`, borderBottom:`1px solid ${surface.border}` }}>
          {CATEGORIES.map((c)=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:"5px 14px", borderRadius:RADIUS.full, border:`1px solid ${catFilter===c?COLORS.primary:surface.border}`, background:catFilter===c?COLORS.primaryMuted:"transparent", color:catFilter===c?COLORS.primary:surface.subtext, fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, cursor:"pointer" }}>
              {c}
            </button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:FONT_SIZE.xs, color:surface.subtext }}>{filtered.length} documents</span>
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:surface.theadBg }}>
                {["Document","Category","Upload Date","Size","Status","Actions"].map((h)=>(
                  <th key={h} style={{ padding:PADDING.tableHeader,textAlign:"left",fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,color:surface.subtext,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:`1px solid ${surface.border}`,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc,i,arr)=>{
                const st = STATUS_STYLE[doc.status]||STATUS_STYLE.Pending;
                const ct = CAT_STYLE[doc.category]||CAT_STYLE.Other;
                return (
                  <tr key={doc.id} style={{ borderBottom:i<arr.length-1?`1px solid ${surface.border}`:"none" }}
                    onMouseEnter={(e)=>(e.currentTarget.style.background=surface.rowHover)}
                    onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}>
                    <td style={{ padding:PADDING.tableCell }}>
                      <div style={{ display:"flex",alignItems:"center",gap:GAP.sm }}>
                        <div style={{ width:34,height:34,borderRadius:RADIUS.md,background:COLORS.primaryMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <IconFile size={16} color={COLORS.primary} stroke={2}/>
                        </div>
                        <span style={{ fontSize:FONT_SIZE.sm,fontWeight:FONT_WEIGHT.medium,color:surface.text }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <span style={{ display:"inline-block",padding:"2px 9px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:ct.bg,color:ct.color }}>{doc.category}</span>
                    </td>
                    <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.sm,color:surface.subtext }}>{doc.uploadDate}</td>
                    <td style={{ padding:PADDING.tableCell,fontSize:FONT_SIZE.sm,color:surface.subtext }}>{doc.size}</td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:RADIUS.full,fontSize:FONT_SIZE.xs,fontWeight:FONT_WEIGHT.semibold,background:st.bg,color:st.color }}>
                        <span style={{ width:5,height:5,borderRadius:"50%",background:st.color,display:"inline-block" }}/>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ padding:PADDING.tableCell }}>
                      <div style={{ display:"flex",gap:GAP.xs }}>
                        <button title="View"     style={{ width:30,height:30,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.primary   }}><IconEye      size={13}/></button>
                        <button title="Download" style={{ width:30,height:30,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.success  }}><IconDownload size={13}/></button>
                        <button title="Delete"   onClick={()=>handleDelete(doc)} style={{ width:30,height:30,borderRadius:RADIUS.md,border:`1px solid ${surface.border}`,background:surface.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:COLORS.danger   }}><IconTrash    size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security notice */}
      <div style={{ marginTop:GAP.md, padding:"12px 16px", borderRadius:RADIUS.xl, background:COLORS.infoLight, border:`1px solid ${COLORS.info}30`, display:"flex", alignItems:"center", gap:GAP.sm }}>
        <IconShieldCheck size={16} color={COLORS.info} stroke={2}/>
        <p style={{ margin:0, fontSize:FONT_SIZE.xs, color:COLORS.info }}>All documents are securely stored and accessible only by you and authorised HR personnel.</p>
      </div>

      {/* ── Upload Modal (Mantine) ── */}
      <AppModal
        opened={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Document"
        subtitle="Add a new document to your profile"
        icon={<IconUpload size={18} color={COLORS.primary} stroke={2} />}
        iconColor={COLORS.primary}
        size="sm"
      >
        <Stack gap="md">
          <AppInput
            label="Document Name *"
            placeholder="e.g. Aadhaar Card"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <AppInput
            type="select"
            label="Category"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            data={["Identity","Education","Employment","Financial","Other"]}
          />
          {/* File picker */}
          <div>
            <label style={{ display:"block", fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:surface.subtext, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>File</label>
            <label style={{ display:"flex", alignItems:"center", gap:GAP.sm, padding:"10px 14px", borderRadius:RADIUS.lg, border:`1.5px dashed ${surface.border}`, background:surface.inputBg, cursor:"pointer" }}>
              <div style={{ width:30, height:30, borderRadius:RADIUS.md, background:COLORS.primaryMuted, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <IconFile size={15} color={COLORS.primary} stroke={2}/>
              </div>
              <span style={{ fontSize:FONT_SIZE.sm, color:surface.subtext, flex:1 }}>{fileName}</span>
              <span style={{ fontSize:FONT_SIZE.xs, fontWeight:FONT_WEIGHT.semibold, color:COLORS.primary, background:COLORS.primaryMuted, padding:"3px 10px", borderRadius:RADIUS.full }}>Browse</span>
              <input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name || "No file chosen")} style={{ display:"none" }}/>
            </label>
          </div>
          <Group justify="flex-end" gap="sm" mt="xs">
            <AppButton variant="default" onClick={() => setShowUpload(false)}>Cancel</AppButton>
            <AppButton
              leftSection={<IconUpload size={14} stroke={2} />}
              onClick={handleUpload}
            >
              Upload
            </AppButton>
          </Group>
        </Stack>
      </AppModal>
    </div>
  );
};

export default MyDocuments;
