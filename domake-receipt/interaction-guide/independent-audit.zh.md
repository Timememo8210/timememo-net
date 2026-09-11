# 四个交互案例独立证据核对

45 / 45 项通过。核对操作轨迹与三条保存记录、金额修正前后读回；截图视觉检查由主执行者完成。

- 32 documented steps：通过
- All screenshots exist：通过
- Distinct four cases have 7/6/7/12 steps：通过
- A unreadable outcome is inline：通过
- A retry opens unsaved-work dialog：通过
- A retry yields same unreadable result：通过
- A file replacement opens unsaved-work dialog：通过
- A cancelling replacement retains source/result：通过
- A never creates a saved record：通过
- A reset returns to empty uploader state：通过
- B partial result opens extraction modal：通过
- B auto-result contains worker/date/amount：通过
- B auto-result lacks company/address/summary：通过
- B edit closes modal and retains values：通过
- B fills three missing fields：通过
- B final confirm unchecked and disabled：通过
- B checking enables confirm：通过
- B saves only after final action：通过
- C actual extracted address is truncated：通过
- C first confirmation preserves truncated address：通过
- C Back to edit preserves all values：通过
- C manual correction supplies complete address：通过
- C service date remains blank：通过
- C new confirmation displays corrected address：通过
- C new confirmation starts unchecked/disabled：通过
- C checking enables confirmation：通过
- C saving creates exactly second record：通过
- C persisted address/date match：通过
- D starts with inline relevance question：通过
- D typo explicitly labelled manual simulation：通过
- D initial confirmation displays 158：通过
- D initial confirmation requires check：通过
- D initially saves third record：通过
- D admin detail/readback confirms saved 158：通过
- D edit navigates to same record：通过
- D reconfirmation shows 185：通过
- D reconfirmation requires a new check：通过
- D update leaves count at three：通过
- D reopened detail shows corrected 185：通过
- D ID/created time/source unchanged：通过
- D update/confirmation timestamps changed：通过
- D only amount and two timestamps changed：通过
- D complete final readback matches after export：通过
- Three distinct confirmed records saved：通过
- Original SHA-256 matches each uploaded fixture：通过

金额更正前后仅 amount.total、updated_at、confirmed_at 变化。
