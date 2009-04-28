<table class="data_table" style="width: 100%;">

<?php foreach($data as $row): ?>

	<tr id="row_<?= $row['id']; ?>">
		<td style=""><img src="<?= base_url(); ?>media/thumbnail/<?= $row['id']; ?>/1" width="16px" height="16px" /></td>
		<td><b><?= $row['filename']; ?></b></td>
		<td style="text-align:right;"><?= $row['length']; ?></td>
		<td style="text-align:right;"><?= $row['dimension']; ?></td>
	</tr>

<?php endforeach; ?>

</table>